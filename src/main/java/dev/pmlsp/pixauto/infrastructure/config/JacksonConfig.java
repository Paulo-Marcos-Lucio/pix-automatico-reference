package dev.pmlsp.pixauto.infrastructure.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring Boot 4 traz Jackson 3 (tools.jackson) como mapper default da camada web,
 * mas o código de domínio (outbox, listener Kafka) ainda serializa eventos com a
 * API estável do Jackson 2 (com.fasterxml.jackson) — que continua no classpath via
 * spring-boot-starter-jackson. Expomos um ObjectMapper Jackson 2 explícito para
 * satisfazer essas injeções e fixar o comportamento de serialização dos eventos
 * (datas ISO-8601, sem timestamps numéricos, omitindo nulos).
 *
 * Antes do Boot 4 isso era um Jackson2ObjectMapperBuilderCustomizer; esse hook
 * deixou de existir no autoconfigure novo, então construímos o mapper direto.
 */
@Configuration
public class JacksonConfig {

    @Bean
    ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .setSerializationInclusion(JsonInclude.Include.NON_NULL);
    }
}
