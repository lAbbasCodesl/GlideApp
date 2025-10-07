package com.glide.search.model;

import java.time.Instant;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.GeoPointField;
import org.springframework.data.elasticsearch.annotations.GeoShapeField;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

@Document(indexName = "rides")
public class RideDocument {

    @Id
    private String rideId;

    @Field(type = FieldType.Keyword)
    private String driverId;

    @Field(type = FieldType.Text)
    private String driverName;

    @Field(type = FieldType.Integer)
    private Integer seatsAvailable;

    @Field(type = FieldType.Double)
    private Double fare;

    @Field(type = FieldType.Text, index = false)
    private String polyline;

    @GeoPointField
    private GeoPoint startPoint;

    @GeoPointField
    private GeoPoint endPoint;

    @GeoShapeField
    private Map<String, Object> route; // GeoJSON object

    @Field(type = FieldType.Date, format = DateFormat.date_time)
    private Instant dateTime;

    public RideDocument() {}

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

    public GeoPoint getStartPoint() { return startPoint; }
    public void setStartPoint(GeoPoint startPoint) { this.startPoint = startPoint; }

    public GeoPoint getEndPoint() { return endPoint; }
    public void setEndPoint(GeoPoint endPoint) { this.endPoint = endPoint; }

    public Map<String, Object> getRoute() { return route; }
    public void setRoute(Map<String, Object> route) { this.route = route; }

    public Instant getDateTime() { return dateTime; }
    public void setDateTime(Instant dateTime) { this.dateTime = dateTime; }
}
