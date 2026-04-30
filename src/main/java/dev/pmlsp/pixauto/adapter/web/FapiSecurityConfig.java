package dev.pmlsp.pixauto.adapter.web;

import dev.pmlsp.pixauto.infrastructure.security.dpop.AccessTokenIntrospector;
import dev.pmlsp.pixauto.infrastructure.security.dpop.DPoPValidator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * FAPI 2.0 + DPoP RFC 9449 security chain — only active when profile {@code fapi}
 * is enabled. Protects Open Finance recurring-payment endpoints (consents,
 * subscriptions, charges) with sender-constrained access tokens.
 * <p>
 * Coexists with the existing permissive {@code SecurityConfig} in
 * {@code infrastructure/config/}: this chain declares {@code @Order(0)} (higher
 * priority) and {@code securityMatcher} only over the OF endpoints, so paths
 * outside its matcher (actuator, webhooks, frontend) still flow through the
 * permissive chain.
 * <p>
 * Lives in {@code adapter/web/} alongside the {@link DPoPAuthenticationFilter}
 * because {@code infrastructure/} layer must not depend on {@code adapter/}
 * (enforced by ArchUnit).
 * <p>
 * To activate: {@code SPRING_PROFILES_ACTIVE=local,fapi mvn spring-boot:run}.
 */
@Configuration
@Profile("fapi")
public class FapiSecurityConfig {

    @Bean
    @Order(0)
    public SecurityFilterChain fapiOpenFinanceChain(HttpSecurity http,
                                                    AccessTokenIntrospector introspector,
                                                    DPoPValidator dpopValidator) throws Exception {
        http
                .securityMatcher("/v1/consents/**", "/v1/subscriptions/**", "/v1/charges/**")
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .addFilterBefore(new DPoPAuthenticationFilter(introspector, dpopValidator),
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
