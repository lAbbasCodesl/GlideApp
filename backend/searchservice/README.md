# GLIDE SearchService

Spring Boot service for ride indexing and search using Elasticsearch.

## Prerequisites
- Java 17
- Maven 3.9+
- Elasticsearch 8.x (see project root docker-compose.yml)

## Run locally

```bash
# From backend/searchservice
mvn spring-boot:run
```

Swagger UI: http://localhost:8080/swagger-ui.html

## Configuration

Configure Elasticsearch via env vars (defaults shown):

```bash
export ELASTICSEARCH_URIS=http://localhost:9200
export ELASTICSEARCH_USERNAME=
export ELASTICSEARCH_PASSWORD=
```

Or edit `src/main/resources/application.yml`.

## API

### Index or update a ride
POST /index/ride

Example:
```json
{
  "rideId": "RIDE123",
  "driverId": "DRIVER1",
  "driverName": "Amit",
  "seatsAvailable": 2,
  "fare": 6.5,
  "polyline": "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
  "startPoint": { "lat": 40.741, "lng": -74.003 },
  "endPoint":   { "lat": 40.732, "lng": -73.991 },
  "route": { "type": "LineString", "coordinates": [[-74.003,40.741],[-73.991,40.732]] },
  "dateTime": "2025-10-07T09:15:00Z"
}
```

### Search rides
POST /search/rides

Example:
```json
{
  "pickup": { "lat": 40.741, "lng": -74.003 },
  "drop":   { "lat": 40.732, "lng": -73.991 },
  "dateTime": "2025-10-07T09:00:00Z",
  "radiusKm": 5,
  "timeWindowMinutes": 60
}
```

Response:
```json
[
  {
    "rideId": "RIDE123",
    "driverName": "Amit",
    "startTime": "2025-10-07T09:15:00Z",
    "availableSeats": 2,
    "fare": 6.5,
    "matchScore": 0.82
  }
]
```

## Docker

```bash
# Build image
docker build -t glide/searchservice:latest .

# Run container (connect to local elasticsearch)
docker run --rm -p 8080:8080 \
  -e ELASTICSEARCH_URIS=http://host.docker.internal:9200 \
  glide/searchservice:latest
```
