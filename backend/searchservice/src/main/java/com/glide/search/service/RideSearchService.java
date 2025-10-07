package com.glide.search.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;

import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.elasticsearch.core.query.NativeQuery;

import co.elastic.clients.elasticsearch._types.GeoShapeRelation;
import co.elastic.clients.json.JsonData;
import org.springframework.stereotype.Service;

import com.glide.search.model.GeoPointDto;
import com.glide.search.model.RideDocument;
import com.glide.search.model.RideSearchRequest;
import com.glide.search.model.RideSearchResponse;

@Service
public class RideSearchService {

    private final ElasticsearchOperations elasticsearchOperations;

    public RideSearchService(ElasticsearchOperations elasticsearchOperations) {
        this.elasticsearchOperations = elasticsearchOperations;
    }

    public List<RideSearchResponse> searchRides(RideSearchRequest request) {
        String distance = String.format("%.3fkm", request.getRadiusKm() == null ? 5.0 : request.getRadiusKm());
        int window = request.getTimeWindowMinutes() == null ? 60 : request.getTimeWindowMinutes();

        Instant gte = request.getDateTime().minus(Duration.ofMinutes(window));
        Instant lte = request.getDateTime().plus(Duration.ofMinutes(window));

        GeoPoint pickupPoint = new GeoPoint(request.getPickup().getLat(), request.getPickup().getLng());
        GeoPoint dropPoint = new GeoPoint(request.getDrop().getLat(), request.getDrop().getLng());

        List<List<Double>> pickupToDropLine = new ArrayList<>();
        pickupToDropLine.add(Arrays.asList(pickupPoint.getLon(), pickupPoint.getLat()));
        pickupToDropLine.add(Arrays.asList(dropPoint.getLon(), dropPoint.getLat()));

        NativeQuery query = NativeQuery.builder()
                .withQuery(q -> q.bool(b -> b
                        .filter(f -> f.range(r -> r
                                .field("dateTime")
                                .gte(JsonData.of(gte.toString()))
                                .lte(JsonData.of(lte.toString()))))
                        .filter(f -> f.range(r -> r
                                .field("seatsAvailable")
                                .gt(JsonData.of(0))))
                        .filter(f -> f.geoDistance(gd -> gd
                                .field("startPoint")
                                .distance(distance)
                                .location(l -> l.lat(pickupPoint.getLat()).lon(pickupPoint.getLon()))))
                        .filter(f -> f.geoDistance(gd -> gd
                                .field("endPoint")
                                .distance(distance)
                                .location(l -> l.lat(dropPoint.getLat()).lon(dropPoint.getLon()))))
                        .filter(f -> f.geoShape(gs -> gs
                                .field("route")
                                .relation(GeoShapeRelation.Intersects)
                                .shape(s -> s.linestring(ls -> ls.coordinates(pickupToDropLine)))))
                ))
                .build();

        SearchHits<RideDocument> hits = elasticsearchOperations.search(query, RideDocument.class);
        List<RideSearchResponse> results = new ArrayList<>();
        for (SearchHit<RideDocument> hit : hits) {
            RideDocument d = hit.getContent();
            double matchScore = computeMatchScore(request.getPickup(), request.getDrop(), request.getDateTime(), d);
            results.add(new RideSearchResponse(
                d.getRideId(),
                d.getDriverName(),
                d.getDateTime(),
                d.getSeatsAvailable(),
                d.getFare(),
                matchScore
            ));
        }
        // naive sort by match score descending
        results.sort((a,b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));
        return results;
    }

    private double computeMatchScore(GeoPointDto pickup, GeoPointDto drop, Instant desiredTime, RideDocument d) {
        // Simple heuristic combining time proximity and start/end proximity
        double timeMinutes = Math.abs(Duration.between(desiredTime, d.getDateTime()).toMinutes());
        double timeScore = Math.max(0.0, 1.0 - (timeMinutes / 120.0)); // 0..1 over 2 hours

        double startDistanceKm = haversineKm(pickup.getLat(), pickup.getLng(), d.getStartPoint().getLat(), d.getStartPoint().getLon());
        double endDistanceKm = haversineKm(drop.getLat(), drop.getLng(), d.getEndPoint().getLat(), d.getEndPoint().getLon());
        double distScore = Math.max(0.0, 1.0 - ((startDistanceKm + endDistanceKm) / 20.0)); // crude

        double seatsScore = d.getSeatsAvailable() != null && d.getSeatsAvailable() > 0 ? 1.0 : 0.0;

        return clamp((timeScore * 0.5) + (distScore * 0.4) + (seatsScore * 0.1), 0.0, 1.0);
    }

    private static double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }

    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
}
