# GLIDE

Carpooling and ridesharing app with Firebase frontend and Spring Boot SearchService.

## Structure
```
backend/searchservice    # Spring Boot + Elasticsearch for route search
frontend/flutter_app     # Flutter app (Firebase + Google Maps)
```

## Prerequisites
- Docker (for Elasticsearch)
- Java 17 + Maven
- Flutter SDK (for frontend)

## Infra: Elasticsearch
```bash
# From project root
docker compose up -d
```
Kibana: http://localhost:5601
Elasticsearch: http://localhost:9200

## Backend: SearchService
```bash
cd backend/searchservice
mvn spring-boot:run
```
Swagger UI: http://localhost:8080/swagger-ui.html

## Frontend: Flutter
```bash
cd frontend/flutter_app
# Ensure you replace firebase_options.dart with your Firebase config
flutter pub get
flutter run
```

Configure backend base URL in `.env`:
```
BACKEND_BASE_URL=http://localhost:8080
```

---

## API Quickstart
Index sample ride:
```bash
curl -X POST http://localhost:8080/index/ride -H 'Content-Type: application/json' -d '{
  "rideId": "RIDE123",
  "driverId": "DRIVER1",
  "driverName": "Amit",
  "seatsAvailable": 2,
  "fare": 6.5,
  "startPoint": {"lat": 40.741, "lng": -74.003},
  "endPoint": {"lat": 40.732, "lng": -73.991},
  "route": {"type":"LineString","coordinates":[[-74.003,40.741],[-73.991,40.732]]},
  "dateTime": "2025-10-07T09:15:00Z"
}'
```

Search rides:
```bash
curl -X POST http://localhost:8080/search/rides -H 'Content-Type: application/json' -d '{
  "pickup": {"lat": 40.741, "lng": -74.003},
  "drop": {"lat": 40.732, "lng": -73.991},
  "dateTime": "2025-10-07T09:00:00Z",
  "radiusKm": 5
}'
```
