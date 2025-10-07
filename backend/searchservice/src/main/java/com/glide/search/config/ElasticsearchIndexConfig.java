package com.glide.search.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;

import com.glide.search.model.RideDocument;

@Configuration
public class ElasticsearchIndexConfig {

    private final ElasticsearchOperations operations;

    public ElasticsearchIndexConfig(ElasticsearchOperations operations) {
        this.operations = operations;
    }

    @PostConstruct
    public void createIndexIfMissing() {
        IndexOperations indexOps = operations.indexOps(RideDocument.class);
        if (!indexOps.exists()) {
            indexOps.create();
            indexOps.putMapping(indexOps.createMapping(RideDocument.class));
        }
    }
}
