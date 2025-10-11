package uao.edu.co.scouts_project.web.controller;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.domain.exception.auth0.Auth0GatewayException;
import uao.edu.co.scouts_project.domain.exception.auth0.ResourceNotFoundException;
import uao.edu.co.scouts_project.domain.exception.auth0.UserAlreadyMemberException;
import uao.edu.co.scouts_project.service.auth0.IAuth0Service;
// no param-level constraints to keep errors in-controller

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth0")
@Tag(name = "Auth0 Management", description = "Endpoints para interactuar con Auth0 Management API")
public class Auth0Controller {

    // Logger can be added if needed
    private final IAuth0Service auth0Service;

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

    @GetMapping("/users/{userId}")
    @Operation(summary = "Obtiene un usuario por su ID en Auth0", responses = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado", content = @Content(schema = @Schema(implementation = UserSummaryDTO.class))),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @ApiResponse(responseCode = "502", description = "Error de integración con Auth0")
    })
    public ResponseEntity<Object> getUserById(@PathVariable @NotNull String userId) {
        try {
            UserSummaryDTO user = auth0Service.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (Auth0GatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(gatewayErrorBody(ex, "Fallo obteniendo usuario"));
        }
    }

    @PostMapping("/users/{userId}/roles")
    @Operation(summary = "Asigna un rol a un usuario existente en Auth0", responses = {
            @ApiResponse(responseCode = "200", description = "Rol asignado correctamente"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida (parámetros requeridos o inválidos)"),
            @ApiResponse(responseCode = "404", description = "Usuario o rol no encontrado"),
            @ApiResponse(responseCode = "502", description = "Error de integración con Auth0")
    })
    public ResponseEntity<Object> assignRoleToUser(
            @PathVariable @NotNull String userId,
            @RequestParam @NotNull String roleId) {
        if (roleId == null || roleId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "roleId es obligatorio"));
        }
        try {
            auth0Service.assignRole(userId, roleId);
            Map<String, Object> body = Map.of(
                    "message", "Rol asignado correctamente",
                    "userId", userId,
                    "roleId", roleId);
            return ResponseEntity.ok(body);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        } catch (Auth0GatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(gatewayErrorBody(ex, "Fallo asignando rol"));
        }
    }

    @PostMapping("/organizations/{organizationId}/members")
    @Operation(summary = "Asocia un usuario a una organización en Auth0", responses = {
            @ApiResponse(responseCode = "200", description = "Usuario asociado a la organización"),
            @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @ApiResponse(responseCode = "404", description = "Organización o usuario no encontrado"),
            @ApiResponse(responseCode = "409", description = "El usuario ya pertenece a la organización"),
            @ApiResponse(responseCode = "502", description = "Error de integración con Auth0")
    })
    public ResponseEntity<Object> addUserToOrganization(
            @PathVariable @NotNull String organizationId,
            @RequestParam @NotNull String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "userId es obligatorio"));
        }
        try {
            auth0Service.addUserToOrganization(organizationId, userId);
            Map<String, Object> body = Map.of(
                    "message", "Usuario agregado a la organización",
                    "organizationId", organizationId,
                    "userId", userId);
            return ResponseEntity.ok(body);
        } catch (UserAlreadyMemberException ex) {
            Map<String, Object> body = Map.of(
                    "message", "El usuario ya pertenece a la organización",
                    "organizationId", organizationId,
                    "userId", userId);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        } catch (Auth0GatewayException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(gatewayErrorBody(ex, "Fallo agregando usuario a organización"));
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
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(gatewayErrorBody(ex, "Fallo creando usuario"));
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

}