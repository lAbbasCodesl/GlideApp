import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { UserProfile } from '../types/user';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Google Sign-In setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '70442870803-8m1jk9rfqp412bbj50cgfunjvj933afl.apps.googleusercontent.com',
    androidClientId: '70442870803-6oforsf4n5doba9do6pjlpg7a554g12j.apps.googleusercontent.com',
  });

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const profileDoc = await getDoc(doc(db, 'users', uid));
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const profile: UserProfile = {
        uid: credential.user.uid,
        email: email,
        displayName: displayName,
        isDriver: false,
        rating: 5.0,
        totalRides: 0,
        hasSeenAppGuide: false,
      };

      await setDoc(doc(db, 'users', credential.user.uid), profile);
      setUserProfile(profile);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message);
    }
  };

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      
      if (result?.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);
        
        // Check if user profile exists, create if not
        const profileDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (!profileDoc.exists()) {
          const profile: UserProfile = {
            uid: userCredential.user.uid,
            email: userCredential.user.email!,
            displayName: userCredential.user.displayName || 'User',
            photoURL: userCredential.user.photoURL || undefined,
            isDriver: false,
            rating: 5.0,
            totalRides: 0,
            hasSeenAppGuide: false,
          };
          await setDoc(doc(db, 'users', userCredential.user.uid), profile);
        }
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(error.message);
    }
  };

  // Apple Sign In
  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken } = credential;
      const provider = new OAuthProvider('apple.com');
      const oauthCredential = provider.credential({
        idToken: identityToken!,
      });

      const userCredential = await signInWithCredential(auth, oauthCredential);

      // Check if user profile exists, create if not
      const profileDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!profileDoc.exists()) {
        const profile: UserProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email || credential.email || '',
          displayName: credential.fullName?.givenName || 'User',
          isDriver: false,
          rating: 5.0,
          totalRides: 0,
          hasSeenAppGuide: false,
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), profile);
      }
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      throw new Error(error.message);
    }
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message);
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message);
    }
  };

  // Update User Profile
  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      setUserProfile(prev => prev ? { ...prev, ...profile } : null);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithApple,
        resetPassword,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
