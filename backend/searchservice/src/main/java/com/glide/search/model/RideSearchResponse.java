package com.glide.search.model;

import java.time.Instant;

public class RideSearchResponse {
    private String rideId;
    private String driverName;
    private String startLocation; // optional human-readable
    private String endLocation;   // optional human-readable
    private Instant startTime;
    private Integer availableSeats;
    private Double fare;
    private Double matchScore;

    public RideSearchResponse() {}

    public RideSearchResponse(String rideId, String driverName, Instant startTime, Integer availableSeats, Double fare, Double matchScore) {
        this.rideId = rideId;
        this.driverName = driverName;
        this.startTime = startTime;
        this.availableSeats = availableSeats;
        this.fare = fare;
        this.matchScore = matchScore;
    }

    public String getRideId() { return rideId; }
    public void setRideId(String rideId) { this.rideId = rideId; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getStartLocation() { return startLocation; }
    public void setStartLocation(String startLocation) { this.startLocation = startLocation; }

    public String getEndLocation() { return endLocation; }
    public void setEndLocation(String endLocation) { this.endLocation = endLocation; }

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }

    public Double getFare() { return fare; }
    public void setFare(Double fare) { this.fare = fare; }

    public Double getMatchScore() { return matchScore; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }
}
