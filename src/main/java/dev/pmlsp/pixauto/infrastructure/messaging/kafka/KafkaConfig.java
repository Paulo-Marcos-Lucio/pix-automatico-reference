package dev.pmlsp.pixauto.infrastructure.messaging.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    NewTopic consentEventsTopic() {
        return TopicBuilder.name(KafkaTopics.CONSENT_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    NewTopic chargeEventsTopic() {
        return TopicBuilder.name(KafkaTopics.CHARGE_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
