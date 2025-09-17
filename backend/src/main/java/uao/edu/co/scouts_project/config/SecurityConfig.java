package uao.edu.co.scouts_project.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // desactiva CSRF en APIs REST
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // permite todas las requests
        return http.build();
    }
}
