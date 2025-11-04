package uao.edu.co.scouts_project.infrastructure.security;

import uao.edu.co.scouts_project.domain.port.AuthoritiesMappingPort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

                                                .requestMatchers("/api/v1/sec/roles").authenticated()
                                                .requestMatchers("/api/v1/sec/org_id").authenticated()
                                                .requestMatchers("/api/v1/sec/connection").authenticated()
                                                .requestMatchers("/api/v1/sec/admin/auth0/connections/*").denyAll()
                                                .requestMatchers(
                                                                "/api/v1/sec/admin/auth0/organizations/*/connections/*")
                                                .denyAll()

                                                .requestMatchers("/api/v1/mock/scouts/list")
                                                .hasAnyRole(ACUDIENTE.name(), DEV_SUPPORT.name())
                                                .requestMatchers("/api/v1/mock/scouts/add/member")
                                                .hasAnyRole(TESORERO.name())
                                                .requestMatchers("/api/v1/mock/scouts/member")
                                                .hasAnyRole(DEV_SUPPORT.name())

                                                // Organigrama

                                                // Operaciones CRUD en tenants

                                                // Exponer públicamente el endpoint para resolver org_id por slug
                                                .requestMatchers(HttpMethod.GET, "/api/v1/tenants/slug/**")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.POST, "/api/v1/tenants")
                                                .hasAnyRole(ADMIN_GLOBAL.name())
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/tenants/*")
                                                .hasAnyRole(ADMIN_GLOBAL.name())
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/tenants/*")
                                                .hasAnyRole(ADMIN_GLOBAL.name())

                                                // GRUPOS:
                                                // 🔓 Todos los GET abiertos
                                                .requestMatchers(HttpMethod.GET, "/api/v1/tenants/*/groups").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/tenants/*/groups/*")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/v1/tenants/*/groups/getAll")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/v1/tenants/*/groups/slug/validate")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.POST, "/api/v1/tenants/*/groups")
                                                .hasRole(ADMIN_GLOBAL.name())

                                                .requestMatchers(HttpMethod.POST, "/api/v1/tenants/*/groups/*/admins")
                                                .hasRole(ADMIN_GLOBAL.name())

                                                .requestMatchers(HttpMethod.PATCH, "/api/v1/tenants/*/groups/*/active")
                                                .hasRole(ADMIN_GLOBAL.name())

                                                .requestMatchers(HttpMethod.PATCH, "/api/v1/tenants/*/groups/*/update")
                                                .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name())
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/tenants/*/groups/*/update")
                                                .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name())

                                                .requestMatchers(HttpMethod.PATCH, "/api/v1/tenants/*/groups/*/logo")
                                                .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name())
                                                .requestMatchers(HttpMethod.PATCH, "/api/v1/tenants/*/groups/*/scarf")
                                                .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name())

                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/tenants/*/groups/*/logo")
                                                .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name())
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/tenants/*/groups/*/scarf")
                                                .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name())

                                                // Operaciones en almacenamiento de imagenes

                                                .requestMatchers(HttpMethod.POST, "/api/v1/storage/**")
                                                .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name(), SCOUTER.name(),
                                                                DEV_SUPPORT.name())

                                                // ==== Auth0 Management Endpoints ====

                                                // // Crear Scout completo (usuario + organización + rol SCOUT)
                                                .requestMatchers(HttpMethod.POST, "/api/v1/auth0/scouts")
                                                .hasAnyRole(ACUDIENTE.name(), ADMIN_GRUPO.name(),
                                                                ADMIN_GLOBAL.name())

                                                // // Cambio de rol: reglas específicas por endpoint
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/auth0/change-role")
                                                .hasAnyRole(ADMIN_GRUPO.name())
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/auth0/change-role-global")
                                                .hasAnyRole(ADMIN_GLOBAL.name())

                                                // // ACUDIENTE: Solo puede CREAR (POST) usuarios y asignarlos a su
                                                // propia
                                                // // organización
                                                .requestMatchers(HttpMethod.POST, "/api/v1/auth0/users")
                                                .hasAnyRole(ACUDIENTE.name(), ADMIN_GRUPO.name(),
                                                                ADMIN_GLOBAL.name())
                                                .requestMatchers(HttpMethod.POST, "/api/v1/auth0/users/*/roles")
                                                .hasAnyRole(ACUDIENTE.name(), ADMIN_GRUPO.name(),
                                                                ADMIN_GLOBAL.name())

                                                // Agregar a organización específica: Solo ADMINS
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/v1/auth0/organizations/*/members")
                                                .hasAnyRole(ADMIN_GRUPO.name(), ADMIN_GLOBAL.name())

                                                // Agregar a organización propia (usa org_id del JWT): ACUDIENTE y
                                                // ADMINS
                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/v1/auth0/organizations/own/members")
                                                .hasAnyRole(ACUDIENTE.name(), ADMIN_GRUPO.name(),
                                                                ADMIN_GLOBAL.name())

                                                // // SOLO ADMINS: Pueden CONSULTAR (GET)
                                                .requestMatchers(HttpMethod.GET, "/api/v1/auth0/**")
                                                .hasAnyRole(ADMIN_GRUPO.name(), ADMIN_GLOBAL.name())
                                                //
                                                // Datos básicos de miembros
                                                .requestMatchers("/api/v1/members/create_member")
                                                .hasAnyRole(ADMIN_GRUPO.name(), ACUDIENTE.name())
                                                .requestMatchers("/api/v1/members/create_member_with_school")
                                                .hasAnyRole(ADMIN_GRUPO.name(), ACUDIENTE.name(), DEV_SUPPORT.name())
                                                .requestMatchers("/api/v1/members/list_members")
                                                .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name(), ACUDIENTE.name())
                                                .requestMatchers("/api/v1/members/list_members_by_subgroup")
                                                .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name())
                                                .requestMatchers("/api/v1/members/list_members_by_status")
                                                .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name())
                                                .requestMatchers("/api/v1/members/list_subGroup_by_memberId")
                                                .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name())
                                                .requestMatchers("/api/v1/members/list_schoolData_by_memberId")
                                                .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name(), SCOUT.name())
                                                .requestMatchers("/api/v1/members/update_member_status/**")
                                                .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name())
                                                .requestMatchers("/api/v1/members/update_member_by_id/**")
                                                .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name(), ACUDIENTE.name())
                                                .requestMatchers("/api/v1/members/update_role/**")
                                                .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name())
                                                .requestMatchers("/api/v1/members/assign_subgroup_and_section/")
                                                .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name())

                                                // // // Cualquier otra operación en auth0: SOLO ADMINS
                                                .requestMatchers("/api/v1/auth0/**")
                                                .hasAnyRole(ADMIN_GRUPO.name(), ADMIN_GLOBAL.name())

                                                // Guardians

                                                .requestMatchers(HttpMethod.GET, "/api/v1/guardian/**")
                                                .hasAnyRole(ACUDIENTE.name(), ADMIN_GRUPO.name(), ADMIN_GLOBAL.name(),
                                                                DEV_SUPPORT.name())
                                                .requestMatchers(HttpMethod.POST, "/api/v1/guardian/**")
                                                .hasAnyRole(ACUDIENTE.name(), ADMIN_GRUPO.name(), ADMIN_GLOBAL.name(),
                                                                DEV_SUPPORT.name())
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/guardian/**")
                                                .hasAnyRole(ACUDIENTE.name(), ADMIN_GRUPO.name(), ADMIN_GLOBAL.name(),
                                                                DEV_SUPPORT.name())
                                                .requestMatchers(HttpMethod.DELETE, "/api/v1/guardian/**")
                                                .hasAnyRole(ACUDIENTE.name(), ADMIN_GRUPO.name(), ADMIN_GLOBAL.name(),
                                                                DEV_SUPPORT.name())

                                                //
                                                // ==== FICHAS MÉDICAS ====

                                                .requestMatchers(HttpMethod.POST,
                                                                "/api/v1/medical_record/create_record/**")
                                                .hasAnyRole(ADMIN_GRUPO.name(), SCOUTER.name())

                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/v1/medical_record/list_record/**")
                                                .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name(), SCOUTER.name(), 
                                                                ACUDIENTE.name(), SCOUT.name())

                                                .requestMatchers(HttpMethod.PUT,
                                                                "/api/v1/medical_record/update_record/**")
                                                .hasAnyRole(ADMIN_GRUPO.name(), SCOUTER.name())

                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/v1/medical_record/list_by_tenant")
                                                .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name(), SCOUTER.name(), 
                                                                ACUDIENTE.name())

                                                //
                                                // Pagos
                                                .requestMatchers(HttpMethod.GET, "/api/v1/finanzas/payments/status/*/*")
                                                .hasAnyRole(ACUDIENTE.name())
                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/v1/finanzas/payments/status/guardian/*")
                                                .hasAnyRole(ACUDIENTE.name())

                                                .requestMatchers("/api/v1/finanzas/payments/**")
                                                .hasAnyRole(TESORERO.name(), ADMIN_GRUPO.name())

                                                // Cuotas
                                                .requestMatchers("/api/v1/finanzas/fees/**")
                                                .hasAnyRole(TESORERO.name(), ADMIN_GRUPO.name())

                                                // Dashboard financiero
                                                .requestMatchers("/api/v1/finanzas/dashboard/**")
                                                .hasAnyRole(TESORERO.name(), ADMIN_GRUPO.name())

                                                //
                                                .anyRequest().permitAll()

                                )
                                .cors(withDefaults())
                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .jwt(jwt -> jwt.jwtAuthenticationConverter(
                                                                jwtAuthenticationConverter())))
                                .build();
        }

        private JwtAuthenticationConverter jwtAuthenticationConverter() {
                JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
                converter.setJwtGrantedAuthoritiesConverter(authoritiesMappingPort::mapFromJwt);
                return converter;
        }

}
