package uao.edu.co.scouts_project.config.openapi;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.security.OAuthFlow;
import io.swagger.v3.oas.annotations.security.OAuthFlows;

/**
 * bearer-jwt: Access Token de usuario final (login interactivo) que pegas en Swagger.
 * internal-client-cc (opcional): token de client credentials (Management / uso interno). Normalmente no lo pegas,
 * lo obtiene el backend para llamar a Auth0 Management API.
 *
 * NOTA:
 * - El Access Token de Management (client credentials) NO se pega en Swagger y expira (claim 'exp').
 * - Se obtiene dinámicamente y se cachea en memoria hasta poco antes de expirar.
 * - Si un token o client secret se expone, rotar el client secret en Auth0 de inmediato.
 *
 * Flujo Management API (client credentials):
 * 1. Backend hace POST https://{domain}/oauth/token (grant_type=client_credentials, audience=.../api/v2/).
 * 2. Auth0 devuelve access_token + expires_in.
 * 3. Se cachea en memoria hasta (exp - margen). Luego se renueva transparente.
 * 4. Este token NO se pega en Swagger. Swagger usa el access token de usuario final (bearer-jwt).
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(title = "Plataforma Scouts API", version = "v1"),
    security = { @SecurityRequirement(name = "bearer-jwt") } // Swagger pedirá este por defecto.
)
@SecurityScheme(
    name = "bearer-jwt",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER
)
// (Opcional) Documentar client credentials para referencia (no necesario si no quieres mostrarlo).
@SecurityScheme(
    name = "internal-client-cc",
    type = SecuritySchemeType.OAUTH2,
    flows = @OAuthFlows(
        clientCredentials = @OAuthFlow(
            tokenUrl = "https://YOUR_AUTH0_DOMAIN/oauth/token" // reemplazar dominio
            // scopes se pueden documentar si deseas: scopes = { @OAuthScope(name="create:users"), ... }
        )
    )
)
public class OpenApiConfig {
    // El botón Authorize muestra bearer-jwt. Usa un Access Token emitido para tu API (audience de tu API).
    // El token del Management API se obtiene internamente vía client credentials y no se pega aquí.
}
