package uao.edu.co.scouts_project.infrastructure.security;

import uao.edu.co.scouts_project.domain.port.AuthoritiesMappingPort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthoritiesMappingPort authoritiesMappingPort;

    @Autowired
    public SecurityConfig(AuthoritiesMappingPort authoritiesMappingPort) {
        this.authoritiesMappingPort = authoritiesMappingPort;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/v1/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/actuator/**").permitAll()

                        .requestMatchers("/api/public").permitAll()
                        .requestMatchers("/api/v1/scouts/list").hasAuthority("SCOPE_read:scouts-list")
                        .requestMatchers("/api/v1/scouts/add/member").hasAuthority("SCOPE_write:scout-member")
                        .requestMatchers("/api/v1/scouts/member").hasAuthority("SCOPE_read:scout-member")
                )
                .cors(withDefaults())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )
                .build();
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesMappingPort::mapFromJwt);
        return converter;
    }

    /*
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
        return source;
    }
    */

}

