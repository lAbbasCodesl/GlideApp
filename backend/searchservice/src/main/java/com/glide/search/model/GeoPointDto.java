package com.glide.search.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class GeoPointDto {
    @Min(value = -90)
    @Max(value = 90)
    private double lat;

    @Min(value = -180)
    @Max(value = 180)
    private double lng;

    public GeoPointDto() {}

    public GeoPointDto(double lat, double lng) {
        this.lat = lat;
        this.lng = lng;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }
}
