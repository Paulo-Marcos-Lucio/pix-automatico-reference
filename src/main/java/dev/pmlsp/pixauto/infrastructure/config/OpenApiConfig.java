package dev.pmlsp.pixauto.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI pixAutomaticoOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("Pix Automatico Reference API")
                .description("Reference implementation for Pix Automatico + Open Finance recurring charges")
                .version("0.1.0")
                .license(new License().name("MIT").url("https://opensource.org/licenses/MIT")));
    }
}
