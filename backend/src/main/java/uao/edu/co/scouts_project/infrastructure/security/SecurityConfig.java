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
import static uao.edu.co.scouts_project.infrastructure.security.Role.*;

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

                        .requestMatchers("/api/v1/mock/scouts/list").hasAnyRole(ACUDIENTE.name(), DEV_SUPPORT.name())
                        .requestMatchers("/api/v1/mock/scouts/add/member").hasAnyRole(TESORERO.name())
                        .requestMatchers("/api/v1/mock/scouts/member").hasAnyRole(DEV_SUPPORT.name())

                        // Organigrama




                        //
                        // Datos básicos de miembros




                        //
                        // Acudientes




                        //
                        // Datos médicos




                        //
                        // Pagos
                        .requestMatchers("/api/v1/finanzas/payments/**").permitAll() // Cambiar a .hasAnyRole(TESORERO.name())
                        .requestMatchers("/api/v1/finanzas/payments").permitAll()



                        // Cuotas
                        .requestMatchers( "/api/v1/finanzas/fees/**").permitAll() //Cambiar a .hasAnyRole(TESORERO.name()) 
                        .requestMatchers("/api/v1/finanzas/fees").permitAll() 

                        //
                        // Planes de adelanto




                        //
                        .anyRequest().permitAll()

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

