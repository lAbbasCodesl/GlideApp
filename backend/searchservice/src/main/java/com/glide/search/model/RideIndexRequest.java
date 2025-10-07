package com.glide.search.model;

import java.time.Instant;
import java.util.Map;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RideIndexRequest {

    @NotBlank
    private String rideId;

    @NotBlank
    private String driverId;

    @NotBlank
    private String driverName;

    @NotNull
    @Min(0)
    private Integer seatsAvailable;

    @NotNull
    private Double fare;

    private String polyline; // optional

    @Valid
    @NotNull
    private GeoPointDto startPoint;

    @Valid
    @NotNull
    private GeoPointDto endPoint;

    @NotNull
    private Map<String, Object> route; // GeoJSON LineString/Polyline

    @NotNull
    private Instant dateTime;

    public String getRideId() { return rideId; }
    public void setRideId(String rideId) { this.rideId = rideId; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public Integer getSeatsAvailable() { return seatsAvailable; }
    public void setSeatsAvailable(Integer seatsAvailable) { this.seatsAvailable = seatsAvailable; }

    public Double getFare() { return fare; }
    public void setFare(Double fare) { this.fare = fare; }

    public String getPolyline() { return polyline; }
    public void setPolyline(String polyline) { this.polyline = polyline; }

    public GeoPointDto getStartPoint() { return startPoint; }
    public void setStartPoint(GeoPointDto startPoint) { this.startPoint = startPoint; }

    public GeoPointDto getEndPoint() { return endPoint; }
    public void setEndPoint(GeoPointDto endPoint) { this.endPoint = endPoint; }

    public Map<String, Object> getRoute() { return route; }
    public void setRoute(Map<String, Object> route) { this.route = route; }

    public Instant getDateTime() { return dateTime; }
    public void setDateTime(Instant dateTime) { this.dateTime = dateTime; }
}
