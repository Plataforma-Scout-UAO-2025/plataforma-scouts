package uao.edu.co.scouts_project.auth.repository;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        return http
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers("/api/public").permitAll()
                        .requestMatchers("/api/v1/mock/scouts/list").hasAuthority("SCOPE_read:scouts-list")
                        .requestMatchers("/api/v1/mock/scouts/add/member").hasAuthority("SCOPE_write:scout-member")
                        .requestMatchers("/api/v1/mock/scouts/member").hasAuthority("SCOPE_read:scout-member")
                )
                .cors(withDefaults())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )
                .build();

    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> permissions = jwt.getClaimAsStringList("permissions");
            if (permissions == null) {
                permissions = Collections.emptyList();
            }
            return permissions.stream()
                    .map(p -> (GrantedAuthority) () -> "SCOPE_" + p)
                    .collect(Collectors.toList());
        });

        return converter;
    }

}
