//He comentado este archivo ya que estaba generando conflicto en la del backend
//El error en cuestion era que ya existe un archivo "SecurityConfig.java" en la ruta "backend/src/main/java/uao/edu/co/scouts_project/auth/config/SecurityConfig.java"

// package uao.edu.co.scouts_project.common.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.web.SecurityFilterChain;

// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {

//   @Bean
//   public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//     http
//       .csrf(csrf -> csrf.disable())
//       .httpBasic(httpBasic -> {})
//       .authorizeHttpRequests(auth -> auth
//         .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
//         .requestMatchers("/api/**").authenticated()
//         .anyRequest().authenticated()
//       );

//     return http.build();
//   }
// }
