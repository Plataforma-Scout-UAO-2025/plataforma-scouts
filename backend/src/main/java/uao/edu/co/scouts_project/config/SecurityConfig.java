package uao.edu.co.scouts_project.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuración de seguridad por perfiles de entorno
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Configuración para desarrollo - Sin CORS, acceso completo
     */
    @Bean
    @Profile("development")
    public SecurityFilterChain developmentFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            // Sin CORS para desarrollo - usar Postman/Swagger
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v1/").permitAll()
                .requestMatchers("/api/v1/qa/").permitAll()
                .requestMatchers("/swagger-ui/").permitAll()
                .requestMatchers("/v3/api-docs/").permitAll()
                .requestMatchers("/swagger-ui.html").permitAll()
                .requestMatchers("/actuator/").permitAll()
                .anyRequest().authenticated()
            );
        
        return http.build();
    }

    /**
     * Configuración para producción - CORS restrictivo, seguridad completa
     */
    @Bean
    @Profile("production")
    public SecurityFilterChain productionFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(productionCorsConfigurationSource()))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v1/qa/").denyAll()   // No endpoints de QA en producción
                .requestMatchers("/swagger-ui/").denyAll()   // No Swagger en producción
                .requestMatchers("/v3/api-docs/").denyAll()
                .requestMatchers("/actuator/health").permitAll() // Solo health check
                .anyRequest().authenticated()
            );
        
        return http.build();
    }

    /**
     * CORS restrictivo para producción
     */
    @Bean
    @Profile("production")
    public CorsConfigurationSource productionCorsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Solo dominios de producción específicos
        configuration.setAllowedOrigins(Arrays.asList(
            "https://scouts.uao.edu.co",
            "https://app.scouts.uao.edu.co"
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/", configuration);
        return source;
    }
}