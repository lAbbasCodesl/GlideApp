// services/locationCacheService.ts
/**
 * Location Cache Service
 * 
 * Handles saving and retrieving user's saved/recent locations
 * Uses AsyncStorage for local persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SAVED_LOCATIONS: 'saved_locations',
  RECENT_LOCATIONS: 'recent_locations',
};

export interface SavedLocation {
  id: string;
  name: string;          // e.g., "Home", "Work", "Gym"
  address: string;
  lat: number;
  lng: number;
  type?: 'home' | 'work' | 'custom';
  createdAt: Date;
  lastUsed?: Date;
}

export interface RecentLocation {
  address: string;
  lat: number;
  lng: number;
  timestamp: Date;
  frequency: number;     // How many times used
}

/**
 * Get all saved locations (Home, Work, etc.)
 */
export async function getSavedLocations(): Promise<SavedLocation[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
    if (!data) return [];
    
    const locations = JSON.parse(data);
    // Parse dates back from strings
    return locations.map((loc: any) => ({
      ...loc,
      createdAt: new Date(loc.createdAt),
      lastUsed: loc.lastUsed ? new Date(loc.lastUsed) : undefined,
    }));
  } catch (error) {
    console.error('Error getting saved locations:', error);
    return [];
  }
}

/**
 * Save a named location (Home, Work, etc.)
 */
export async function saveLocation(
  name: string,
  address: string,
  lat: number,
  lng: number,
  type?: 'home' | 'work' | 'custom'
): Promise<void> {
  try {
    const locations = await getSavedLocations();
    
    // Check if location with this name already exists
    const existingIndex = locations.findIndex(loc => loc.name === name);
    
    const newLocation: SavedLocation = {
      id: existingIndex >= 0 ? locations[existingIndex].id : Date.now().toString(),
      name,
      address,
      lat,
      lng,
      type,
      createdAt: existingIndex >= 0 ? locations[existingIndex].createdAt : new Date(),
      lastUsed: new Date(),
    };
    
    if (existingIndex >= 0) {
      // Update existing
      locations[existingIndex] = newLocation;
    } else {
      // Add new
      locations.push(newLocation);
    }
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVED_LOCATIONS,
      JSON.stringify(locations)
    );
    
    console.log('✅ Location saved:', name);
  } catch (error) {
    console.error('Error saving location:', error);
    throw error;
  }
}

/**
 * Delete a saved location
 */
export async function deleteSavedLocation(locationId: string): Promise<void> {
  try {
    const locations = await getSavedLocations();
    const filtered = locations.filter(loc => loc.id !== locationId);
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVED_LOCATIONS,
      JSON.stringify(filtered)
    );
    
    console.log('✅ Location deleted');
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
}

/**
 * Update last used timestamp for a saved location
 */
export async function updateLocationLastUsed(name: string): Promise<void> {
  try {
    const locations = await getSavedLocations();
    const location = locations.find(loc => loc.name === name);
    
    if (location) {
      location.lastUsed = new Date();
      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_LOCATIONS,
        JSON.stringify(locations)
      );
    }
  } catch (error) {
    console.error('Error updating last used:', error);
  }
}

/**
 * Get recent locations (auto-saved from usage)
 */
export async function getRecentLocations(limit: number = 10): Promise<RecentLocation[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_LOCATIONS);
    if (!data) return [];
    
    const locations = JSON.parse(data);
    // Parse dates and sort by frequency then timestamp
    const parsed = locations.map((loc: any) => ({
      ...loc,
      timestamp: new Date(loc.timestamp),
    }));
    
    // Sort by frequency (descending) then timestamp (descending)
    parsed.sort((a: RecentLocation, b: RecentLocation) => {
      if (b.frequency !== a.frequency) {
        return b.frequency - a.frequency;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
    
    return parsed.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent locations:', error);
    return [];
  }
}

/**
 * Add location to recent history
 * Automatically tracks frequency
 */
export async function addRecentLocation(
  address: string,
  lat: number,
  lng: number
): Promise<void> {
  try {
    const locations = await getRecentLocations(100); // Get all for processing
    
    // Check if this address already exists (within 50m)
    const existingIndex = locations.findIndex(loc => {
      const distance = calculateDistance(lat, lng, loc.lat, loc.lng);
      return distance < 0.05; // 50 meters
    });
    
    if (existingIndex >= 0) {
      // Update existing - increment frequency
      locations[existingIndex].frequency += 1;
      locations[existingIndex].timestamp = new Date();
      locations[existingIndex].address = address; // Update address in case it changed
    } else {
      // Add new location
      locations.unshift({
        address,
        lat,
        lng,
        timestamp: new Date(),
        frequency: 1,
      });
    }
    
    // Keep only last 100 locations
    const trimmed = locations.slice(0, 100);
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.RECENT_LOCATIONS,
      JSON.stringify(trimmed)
    );
    
    console.log('✅ Recent location added');
  } catch (error) {
    console.error('Error adding recent location:', error);
  }
}

/**
 * Clear all recent locations
 */
export async function clearRecentLocations(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_LOCATIONS);
    console.log('✅ Recent locations cleared');
  } catch (error) {
    console.error('Error clearing recent locations:', error);
    throw error;
  }
}

/**
 * Calculate distance between two coordinates (in km)
 * Using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Search saved and recent locations
 */
export async function searchLocations(query: string): Promise<{
  saved: SavedLocation[];
  recent: RecentLocation[];
}> {
  try {
    const [saved, recent] = await Promise.all([
      getSavedLocations(),
      getRecentLocations(),
    ]);
    
    const lowerQuery = query.toLowerCase();
    
    return {
      saved: saved.filter(loc =>
        loc.name.toLowerCase().includes(lowerQuery) ||
        loc.address.toLowerCase().includes(lowerQuery)
      ),
      recent: recent.filter(loc =>
        loc.address.toLowerCase().includes(lowerQuery)
      ),
    };
  } catch (error) {
    console.error('Error searching locations:', error);
    return { saved: [], recent: [] };
  }
}