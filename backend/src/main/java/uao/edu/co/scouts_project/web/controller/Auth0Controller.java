package uao.edu.co.scouts_project.web.controller;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import uao.edu.co.scouts_project.application.service.IAuth0Service;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserWithRoleCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserAuth0ChangeRoleDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.common.ResponseDTO;
import uao.edu.co.scouts_project.domain.exception.auth0.UnauthorizedRoleAssignmentException;
import uao.edu.co.scouts_project.domain.exception.auth0.ResourceNotFoundException;
import uao.edu.co.scouts_project.domain.exception.auth0.Auth0GatewayException;
import uao.edu.co.scouts_project.domain.exception.auth0.UserAlreadyMemberException;
import uao.edu.co.scouts_project.infrastructure.security.Role;
import uao.edu.co.scouts_project.organigrama.dto.CreateGroupDTO;

import org.springframework.security.access.prepost.PreAuthorize;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.util.*;

@RestController
@RequestMapping("/api/v1/auth0")
@Tag(name = "Auth0 Management", description = "Endpoints para interactuar con Auth0 Management API")
public class Auth0Controller {

    private final IAuth0Service auth0Service;
    private final Logger logger = org.slf4j.LoggerFactory.getLogger(Auth0Controller.class);

    public Auth0Controller(IAuth0Service auth0Service) {
        this.auth0Service = auth0Service;
    }

    @GetMapping("/users")
    @Operation(summary = "Lista todos los usuarios registrados en Auth0", responses = {
            @ApiResponse(responseCode = "200", description = "Listado de usuarios devuelto correctamente"),
            @ApiResponse(responseCode = "502", description = "Error de integración con Auth0")
    })
    public ResponseEntity<List<UserSummaryDTO>> listUsers() {
        try {
            List<UserSummaryDTO> users = auth0Service.listUsers();
            return ResponseEntity.ok(users);
        } catch (Auth0GatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(null);
        }
    }

    @GetMapping("/organizations")
    @Operation(summary = "Lista todas las organizaciones registradas en Auth0", responses = {
            @ApiResponse(responseCode = "200", description = "Listado de organizaciones devuelto correctamente"),
            @ApiResponse(responseCode = "502", description = "Error de integración con Auth0")
    })
    public ResponseEntity<List<OrganizationSummaryDTO>> listOrganizations() {
        try {
            List<OrganizationSummaryDTO> orgs = auth0Service.listOrganizations();
            return ResponseEntity.ok(orgs);
        } catch (Auth0GatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(null);
        }
    }

    @GetMapping("/roles")
    @Operation(summary = "Lista todos los roles configurados en Auth0", responses = {
            @ApiResponse(responseCode = "200", description = "Listado de roles devuelto correctamente"),
            @ApiResponse(responseCode = "502", description = "Error de integración con Auth0")
    })
    public ResponseEntity<List<RoleSummaryDTO>> listRoles() {
        try {
            List<RoleSummaryDTO> roles = auth0Service.listRoles();
            return ResponseEntity.ok(roles);
        } catch (Auth0GatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(null);
        }
    }

    @PostMapping("/users")
    @Operation(summary = "Crea un nuevo usuario en Auth0 con email, password y username", responses = {
            @ApiResponse(responseCode = "200", description = "Usuario creado", content = @Content(schema = @Schema(implementation = CreatedUserDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "502", description = "Error de integración con Auth0")
    })
    @RequestBody(required = true, description = "Datos para crear el usuario", content = @Content(schema = @Schema(implementation = CreateUserCommandDTO.class)))
    public ResponseEntity<Object> createUser(
            @Valid @org.springframework.web.bind.annotation.RequestBody CreateUserCommandDTO request,
            BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(validationErrorBody(bindingResult));
            }
            CreatedUserDTO created = auth0Service.createUser(request);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        } catch (Auth0GatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(gatewayErrorBody(ex, "Fallo creando usuario"));
        }
    }

    @PostMapping("/scouts")
    @Operation(summary = "Crea un usuario Scout completo: crea en Auth0, asocia a tu organización y asigna rol SCOUT", responses = {
            @ApiResponse(responseCode = "200", description = "Scout creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "403", description = "No autorizado para asignar rol SCOUT"),
            @ApiResponse(responseCode = "409", description = "El usuario ya pertenece a la organización"),
            @ApiResponse(responseCode = "502", description = "Error de integración con Auth0")
    })
    @RequestBody(required = true, description = "Datos para crear el Scout", content = @Content(schema = @Schema(implementation = CreateUserCommandDTO.class)))
    public ResponseEntity<Object> createScoutOnAuth0(
            @Valid @org.springframework.web.bind.annotation.RequestBody CreateUserCommandDTO request,
            BindingResult bindingResult) {
        try {

            if (bindingResult.hasErrors()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(validationErrorBody(bindingResult));
            }

            // Paso 1: Crear usuario en Auth0
            CreatedUserDTO createdUser = auth0Service.createUser(request);
            String userId = createdUser.getId();

            // Paso 2: Asociar a la organización del usuario autenticado (usa org_id del
            // JWT)
            auth0Service.addUserToOwnOrganization(userId);

            // Paso 3: Asignar rol SCOUT
            auth0Service.assignRole(userId, Role.SCOUT);

            Map<String, Object> body = Map.of(
                    "message", "Scout creado exitosamente",
                    "userId", userId,
                    "email", createdUser.getEmail(),
                    "username", createdUser.getUsername(),
                    "role", "SCOUT");
            return ResponseEntity.ok(body);

        } catch (UserAlreadyMemberException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "El usuario ya pertenece a la organización"));
        } catch (UnauthorizedRoleAssignmentException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        } catch (Auth0GatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(gatewayErrorBody(ex, "Fallo creando Scout"));
        }
    }

    private Map<String, Object> validationErrorBody(BindingResult bindingResult) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Solicitud inválida");
        Map<String, String> errors = new HashMap<>();
        for (var error : bindingResult.getFieldErrors()) {
            errors.put(((FieldError) error).getField(), error.getDefaultMessage());
        }
        body.put("errors", errors);
        return body;
    }

    private Map<String, Object> gatewayErrorBody(Auth0GatewayException ex, String fallbackMessage) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", fallbackMessage);
        body.put("detail", ex.getMessage());
        Throwable cause = ex.getCause();
        if (cause != null) {
            body.put("cause", cause.getClass().getSimpleName());
            body.put("causeMessage", cause.getMessage());
        }
        return body;
    }

    @PostMapping("/create-user")
    @PreAuthorize("hasAnyRole('ADMIN_GRUPO', 'ADMIN_GLOBAL')")
    @Operation(summary = "Crea un usuario completo con rol específico (Solo ADMIN_GRUPO y ADMIN_GLOBAL)", description = "Crea un usuario en Auth0, lo asocia a la organización del admin autenticado y le asigna el rol especificado. "
            +
            "Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN. " +
            "NO se pueden crear roles administrativos (ADMIN_GLOBAL, ADMIN_GRUPO, DEV_SUPPORT).", responses = {
                    @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente", content = @Content(schema = @Schema(implementation = CreatedUserDTO.class))),
                    @ApiResponse(responseCode = "400", description = "Solicitud inválida o rol no permitido"),
                    @ApiResponse(responseCode = "403", description = "No autorizado - Solo ADMIN_GRUPO y ADMIN_GLOBAL pueden usar este endpoint"),
                    @ApiResponse(responseCode = "409", description = "El usuario ya pertenece a la organización"),
                    @ApiResponse(responseCode = "502", description = "Error de integración con Auth0")
            })
    @RequestBody(required = true, description = "Datos para crear el usuario con rol específico", content = @Content(schema = @Schema(implementation = CreateUserWithRoleCommandDTO.class)))
    public ResponseEntity<ResponseDTO<CreatedUserDTO>> createUserWithRole(
            @Valid @org.springframework.web.bind.annotation.RequestBody CreateUserWithRoleCommandDTO request,
            BindingResult bindingResult) {
        try {
            // Validar errores de binding
            if (bindingResult.hasErrors()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ResponseDTO.<CreatedUserDTO>builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .message("Solicitud inválida")
                                .build());
            }

            // Crear usuario con rol
            CreatedUserDTO createdUser = auth0Service.createUserWithRole(request);

            return ResponseEntity.ok(
                    ResponseDTO.<CreatedUserDTO>builder()
                            .status(HttpStatus.OK.value())
                            .message("Usuario creado exitosamente")
                            .data(createdUser)
                            .build());

        } catch (UserAlreadyMemberException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ResponseDTO.<CreatedUserDTO>builder()
                            .status(HttpStatus.CONFLICT.value())
                            .message("El usuario ya pertenece a la organización")
                            .build());

        } catch (UnauthorizedRoleAssignmentException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ResponseDTO.<CreatedUserDTO>builder()
                            .status(HttpStatus.FORBIDDEN.value())
                            .message(ex.getMessage())
                            .build());

        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.<CreatedUserDTO>builder()
                            .status(HttpStatus.NOT_FOUND.value())
                            .message(ex.getMessage())
                            .build());

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseDTO.<CreatedUserDTO>builder()
                            .status(HttpStatus.BAD_REQUEST.value())
                            .message(ex.getMessage())
                            .build());

        } catch (Auth0GatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ResponseDTO.<CreatedUserDTO>builder()
                            .status(HttpStatus.BAD_GATEWAY.value())
                            .message("Fallo creando usuario con rol")
                            .build());
        }
    }

    // --- Change role (Group Admin) ---
    @PutMapping("/change-role")
    @PreAuthorize("hasRole('ADMIN_GRUPO')")
    @Operation(summary = "Cambia el rol único de un usuario (solo roles no administrativos)", responses = {
            @ApiResponse(responseCode = "200", description = "Rol cambiado", content = @Content(schema = @Schema(implementation = ResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "403", description = "Rol no permitido / Usuario fuera de alcance"),
            @ApiResponse(responseCode = "404", description = "Usuario o rol no encontrado"),
            @ApiResponse(responseCode = "502", description = "Error de integración con Auth0")
    })
    public ResponseEntity<ResponseDTO<Void>> changeUserRole(
            @Valid @org.springframework.web.bind.annotation.RequestBody UserAuth0ChangeRoleDTO request,
            BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ResponseDTO.<Void>builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .message("Solicitud inválida")
                                .build());
            }

            auth0Service.changeUserRole(request);

            return ResponseEntity.ok(
                    ResponseDTO.<Void>builder()
                            .status(HttpStatus.OK.value())
                            .message("Rol cambiado exitosamente")
                            .build());
        } catch (UnauthorizedRoleAssignmentException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    ResponseDTO.<Void>builder()
                            .status(HttpStatus.FORBIDDEN.value())
                            .message(ex.getMessage())
                            .build());
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseDTO.<Void>builder()
                            .status(HttpStatus.NOT_FOUND.value())
                            .message(ex.getMessage())
                            .build());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseDTO.<Void>builder()
                            .status(HttpStatus.BAD_REQUEST.value())
                            .message(ex.getMessage())
                            .build());
        } catch (Auth0GatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(
                    ResponseDTO.<Void>builder()
                            .status(HttpStatus.BAD_GATEWAY.value())
                            .message("Fallo cambiando rol en Auth0")
                            .build());
        }
    }

    @Operation(summary = "Crea un nuevo Tenant y su organización en Auth0", description = "Crea la organización, conexión, usuario administrador, tenant y grupo asociado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tenant creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o faltantes"),
            @ApiResponse(responseCode = "500", description = "Error interno en el proceso")
    })
    @PostMapping(value = "/tenants", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE }, produces = {
            MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<?> createTenant(
            @Parameter(description = "Datos del grupo base para el tenant", required = true) @RequestPart("group") CreateGroupDTO group,

            @Parameter(description = "Logo del grupo o tenant", schema = @Schema(type = "string", format = "binary")) @RequestPart("logoFile") MultipartFile logoFile) {
        logger.info("🔹 [Auth0Controller] Iniciando creación de tenant con slug: {}", group.getSlug());
        try {
            String result = auth0Service.createTenant(group, logoFile);
            logger.info("✅ [Auth0Controller] Tenant creado exitosamente para slug: {}", group.getSlug());
            return ResponseEntity.ok().body(result);
        } catch (IllegalArgumentException e) {
            logger.error("⚠️ Error de validación: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("❌ Error al crear tenant: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error interno al crear el tenant");
        }
    }

    // --- Change role (Global Admin) ---
    @PutMapping("/change-role-global")
    @PreAuthorize("hasRole('ADMIN_GLOBAL')")
    @Operation(summary = "Cambia el rol único de un usuario (cualquier rol). Puede validar contra una organización específica", requestBody = @RequestBody(required = true, content = @Content(schema = @Schema(implementation = UserAuth0ChangeRoleDTO.class))), responses = {
            @ApiResponse(responseCode = "200", description = "Rol cambiado", content = @Content(schema = @Schema(implementation = ResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "404", description = "Usuario o rol no encontrado"),
            @ApiResponse(responseCode = "502", description = "Error de integración con Auth0")
    })
    public ResponseEntity<ResponseDTO<Void>> changeUserRoleGlobal(
            @Valid @org.springframework.web.bind.annotation.RequestBody UserAuth0ChangeRoleDTO request,
            BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ResponseDTO.<Void>builder()
                                .status(HttpStatus.BAD_REQUEST.value())
                                .message("Solicitud inválida")
                                .build());
            }

            // organizationId (opcional) viene en el body. El servicio validará membresía si
            // se envía.
            auth0Service.changeUserRoleGlobal(request);

            return ResponseEntity.ok(
                    ResponseDTO.<Void>builder()
                            .status(HttpStatus.OK.value())
                            .message("Rol cambiado exitosamente")
                            .build());
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseDTO.<Void>builder()
                            .status(HttpStatus.NOT_FOUND.value())
                            .message(ex.getMessage())
                            .build());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseDTO.<Void>builder()
                            .status(HttpStatus.BAD_REQUEST.value())
                            .message(ex.getMessage())
                            .build());
        } catch (Auth0GatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(
                    ResponseDTO.<Void>builder()
                            .status(HttpStatus.BAD_GATEWAY.value())
                            .message("Fallo cambiando rol en Auth0")
                            .build());
        }
    }

}