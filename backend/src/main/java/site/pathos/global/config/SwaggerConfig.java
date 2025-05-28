package site.pathos.global.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(title = "PlanList API", version = "v1"),
        servers = {
                @Server(url = "https://pathos.o-r.kr", description = "Production server"),
                @Server(url = "http://localhost:8080", description = "Develop server")
        }
)
@Configuration
public class SwaggerConfig {}