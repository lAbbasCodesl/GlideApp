package com.glide.search.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.glide.search.model.RideDocument;
import com.glide.search.model.RideIndexRequest;
import com.glide.search.model.RideSearchRequest;
import com.glide.search.model.RideSearchResponse;
import com.glide.search.repository.RideRepository;
import com.glide.search.service.RideSearchService;

import jakarta.validation.Valid;

@RestController
@RequestMapping
@Validated
@CrossOrigin(origins = "*")
public class RideController {

    private final RideRepository rideRepository;
    private final RideSearchService rideSearchService;

    public RideController(RideRepository rideRepository, RideSearchService rideSearchService) {
        this.rideRepository = rideRepository;
        this.rideSearchService = rideSearchService;
    }

    @PostMapping("/index/ride")
    public ResponseEntity<?> indexRide(@Valid @RequestBody RideIndexRequest request) {
        RideDocument d = new RideDocument();
        d.setRideId(request.getRideId());
        d.setDriverId(request.getDriverId());
        d.setDriverName(request.getDriverName());
        d.setSeatsAvailable(request.getSeatsAvailable());
        d.setFare(request.getFare());
        d.setPolyline(request.getPolyline());
        d.setStartPoint(new org.springframework.data.elasticsearch.core.geo.GeoPoint(request.getStartPoint().getLat(), request.getStartPoint().getLng()));
        d.setEndPoint(new org.springframework.data.elasticsearch.core.geo.GeoPoint(request.getEndPoint().getLat(), request.getEndPoint().getLng()));
        d.setRoute(request.getRoute());
        d.setDateTime(request.getDateTime());

        RideDocument saved = rideRepository.save(d);
        Map<String, Object> resp = new HashMap<>();
        resp.put("rideId", saved.getRideId());
        resp.put("status", "indexed");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/search/rides")
    public ResponseEntity<List<RideSearchResponse>> searchRides(@Valid @RequestBody RideSearchRequest request) {
        List<RideSearchResponse> results = rideSearchService.searchRides(request);
        return ResponseEntity.ok(results);
    }

    @DeleteMapping("/index/ride/{id}")
    public ResponseEntity<?> deleteRide(@PathVariable("id") String rideId) {
        rideRepository.deleteById(rideId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("rideId", rideId);
        resp.put("status", "deleted");
        return ResponseEntity.ok(resp);
    }
}
