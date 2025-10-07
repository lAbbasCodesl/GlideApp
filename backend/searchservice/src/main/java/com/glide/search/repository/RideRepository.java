package com.glide.search.repository;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import com.glide.search.model.RideDocument;

@Repository
public interface RideRepository extends ElasticsearchRepository<RideDocument, String> {
}
