package dev.pmlsp.pixauto.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.util.List;

/**
 * Serves the bundled React SPA from classpath:/static/ and falls back to
 * index.html for unknown paths so client-side router handles deep links
 * (e.g. /dashboard, /charges/{uuid}) on browser refresh.
 *
 * API and infrastructure paths are excluded from the fallback so they keep
 * resolving to controllers or 404s as expected.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private static final List<String> NON_SPA_PREFIXES = List.of(
            "v1/", "webhooks/", "actuator", "v3/", "swagger-ui");

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new SpaPathResourceResolver());
    }

    static class SpaPathResourceResolver extends PathResourceResolver {

        @Override
        protected Resource getResource(String resourcePath, Resource location) throws IOException {
            // Don't intercept API/infra paths — let controllers and SpringDoc resolve them.
            for (String prefix : NON_SPA_PREFIXES) {
                if (resourcePath.startsWith(prefix)) {
                    return null;
                }
            }

            Resource requested = location.createRelative(resourcePath);
            if (requested.exists() && requested.isReadable()) {
                return requested;
            }

            // Unknown non-asset path: serve the SPA shell.
            ClassPathResource shell = new ClassPathResource("/static/index.html");
            return shell.exists() ? shell : null;
        }
    }
}
