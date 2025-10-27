package uao.edu.co.scouts_project.infrastructure.security;

import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import uao.edu.co.scouts_project.domain.port.AuthoritiesMappingPort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import uao.edu.co.scouts_project.multitenancy.JwtTenantFilter;

import static org.springframework.security.config.Customizer.withDefaults;
import static uao.edu.co.scouts_project.infrastructure.security.Role.*;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private final AuthoritiesMappingPort authoritiesMappingPort;
        private final JwtTenantFilter jwtTenantFilter;

        @Autowired
        public SecurityConfig(AuthoritiesMappingPort authoritiesMappingPort, JwtTenantFilter jwtTenantFilter) {
                this.authoritiesMappingPort = authoritiesMappingPort;
                this.jwtTenantFilter = jwtTenantFilter;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                return http
                        .addFilterAfter(jwtTenantFilter, BearerTokenAuthenticationFilter.class)
                        .csrf(csrf -> csrf.disable())
                            .authorizeHttpRequests(authorize -> authorize
                                    // Health check
                                    .requestMatchers("/api/v1/test/health").permitAll()

                                    .requestMatchers("/api/v1/sec/roles").authenticated()
                                    .requestMatchers("/api/v1/sec/org_id").authenticated()

                                    .requestMatchers("/api/v1/mock/scouts/list")
                                    .hasAnyRole(ACUDIENTE.name(), DEV_SUPPORT.name())
                                    .requestMatchers("/api/v1/mock/scouts/add/member")
                                    .hasAnyRole(TESORERO.name())
                                    .requestMatchers("/api/v1/mock/scouts/member")
                                    .hasAnyRole(DEV_SUPPORT.name())

                                    // Organigrama

                                    // Operaciones CRUD en tenants

                                    .requestMatchers(HttpMethod.POST, "/api/v1/tenants")
                                    .hasAnyRole(ADMIN_GLOBAL.name())
                                    .requestMatchers(HttpMethod.PUT, "/api/v1/tenants/*")
                                    .hasAnyRole(ADMIN_GLOBAL.name())
                                    .requestMatchers(HttpMethod.DELETE, "/api/v1/tenants/*")
                                    .hasAnyRole(ADMIN_GLOBAL.name())
                                    // Operaciones CRUD en grupos

                                    .requestMatchers(HttpMethod.POST, "/api/v1/tenants/*/groups/**")
                                    .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name(), SCOUTER.name(),
                                                    DEV_SUPPORT.name())
                                    .requestMatchers(HttpMethod.PUT, "/api/v1/tenants/*/groups/**")
                                    .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name(), SCOUTER.name(),
                                                    DEV_SUPPORT.name())
                                    .requestMatchers(HttpMethod.PATCH, "/api/v1/tenants/*/groups/**")
                                    .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name(), SCOUTER.name(),
                                                    DEV_SUPPORT.name())
                                    .requestMatchers(HttpMethod.DELETE, "/api/v1/tenants/*/groups/**")
                                    .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name(), SCOUTER.name(),
                                                    DEV_SUPPORT.name())

                                    // Operaciones de consulta en grupos

                                    .requestMatchers(HttpMethod.GET, "/api/v1/tenants/*/groups/**")
                                    .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name(),
                                                    COMITE_ADMIN.name(), DEV_SUPPORT.name(),
                                                    SCOUTER.name(), TESORERO.name(), ACUDIENTE.name(),
                                                    SCOUT.name())
                                    .requestMatchers(HttpMethod.GET, "/api/v1/tenants/*")
                                    .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name(),
                                                    COMITE_ADMIN.name(), DEV_SUPPORT.name(),
                                                    SCOUTER.name(), TESORERO.name(), ACUDIENTE.name(),
                                                    SCOUT.name())

                                    // Operaciones en almacenamiento de imagenes

                                    .requestMatchers(HttpMethod.POST, "/api/v1/storage/**")
                                    .hasAnyRole(ADMIN_GLOBAL.name(), ADMIN_GRUPO.name(), SCOUTER.name(),
                                                    DEV_SUPPORT.name())

                                    // ==== Auth0 Management Endpoints ====

                                    // Crear Scout completo (usuario + organización + rol SCOUT)
                                    .requestMatchers(HttpMethod.POST, "/api/v1/auth0/scouts")
                                    .hasAnyRole(ACUDIENTE.name(), ADMIN_GRUPO.name(),
                                                    ADMIN_GLOBAL.name())

                                    // ACUDIENTE: Solo puede CREAR (POST) usuarios y asignarlos a su propia
                                    // organización
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
                                    .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name(), SCOUTER.name())
                                    .requestMatchers("/api/v1/members/list_members_by_subgroup")
                                    .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name(), SCOUTER.name())
                                    .requestMatchers("/api/v1/members/list_members_by_status")
                                    .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name(), SCOUTER.name())
                                    .requestMatchers("/api/v1/members/list_subGroup_by_memberId")
                                    .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name(), SCOUTER.name())
                                    .requestMatchers("/api/v1/members/list_schoolData_by_memberId")
                                    .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name())
                                    .requestMatchers("/api/v1/members/list_members_with_details")
                                    .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name())
                                    .requestMatchers("/api/v1/members/update_member_status/**")
                                    .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name())
                                    .requestMatchers("/api/v1/members/update_member_by_id/**")
                                    .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name())
                                    .requestMatchers("/api/v1/members/assign_subgroup_and_section/")
                                    .hasAnyRole(ADMIN_GRUPO.name(), DEV_SUPPORT.name())

                                    // // Cualquier otra operación en auth0: SOLO ADMINS
                                    .requestMatchers("/api/v1/auth0/**")
                                    .hasAnyRole(ADMIN_GRUPO.name(), ADMIN_GLOBAL.name())

                                    // //
                                    // // Datos básicos de miembros

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

                                    .requestMatchers(HttpMethod.POST, "/api/v1/medical_record/create_record/**")
                                    .hasAnyRole(ADMIN_GRUPO.name(), SCOUTER.name())

                                    .requestMatchers(HttpMethod.GET, "/api/v1/medical_record/list_record/**")
                                    .hasAnyRole(ADMIN_GRUPO.name(), SCOUTER.name(), ACUDIENTE.name(), SCOUT.name())

                                    .requestMatchers(HttpMethod.PUT, "/api/v1/medical_record/update_record/**")
                                    .hasAnyRole(ADMIN_GRUPO.name(), SCOUTER.name())

                                    .requestMatchers(HttpMethod.GET, "/api/v1/medical_record/list_by_tenant")
                                    .hasAnyRole(ADMIN_GRUPO.name(), SCOUTER.name())

                                    //
                                    // Pagos
                                    .requestMatchers(HttpMethod.GET,"/api/v1/finanzas/payments/status/*/*")
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
