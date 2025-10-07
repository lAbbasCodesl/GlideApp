package com.glide.search.model;

import java.time.Instant;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class RideSearchRequest {
    @Valid
    @NotNull
    private GeoPointDto pickup;

    @Valid
    @NotNull
    private GeoPointDto drop;

    @NotNull
    private Instant dateTime;

    private Double radiusKm = 5.0; // default

    private Integer timeWindowMinutes = 60; // default +/- 60 minutes

    public GeoPointDto getPickup() { return pickup; }
    public void setPickup(GeoPointDto pickup) { this.pickup = pickup; }

    public GeoPointDto getDrop() { return drop; }
    public void setDrop(GeoPointDto drop) { this.drop = drop; }

    public Instant getDateTime() { return dateTime; }
    public void setDateTime(Instant dateTime) { this.dateTime = dateTime; }

    public Double getRadiusKm() { return radiusKm; }
    public void setRadiusKm(Double radiusKm) { this.radiusKm = radiusKm; }

    public Integer getTimeWindowMinutes() { return timeWindowMinutes; }
    public void setTimeWindowMinutes(Integer timeWindowMinutes) { this.timeWindowMinutes = timeWindowMinutes; }
}
