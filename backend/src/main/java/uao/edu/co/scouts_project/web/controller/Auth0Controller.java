package uao.edu.co.scouts_project.web.controller;


import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.RolesPage;
import com.auth0.json.mgmt.users.User;
import com.auth0.json.mgmt.users.UsersPage;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import uao.edu.co.scouts_project.infrastructure.auth0.Auth0ManagementClientProvider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth0")
@Tag(name = "Auth0 Management", description = "Endpoints para interactuar con Auth0 Management API")
public class Auth0Controller {

    private static final Logger log = LoggerFactory.getLogger(Auth0Controller.class);
    private final Auth0ManagementClientProvider clientProvider;

    public Auth0Controller(Auth0ManagementClientProvider clientProvider) {
        this.clientProvider = clientProvider;
    }


    // --- 🔹 Listar usuarios ---
@GetMapping("/users")
@Operation(summary = "Lista todos los usuarios registrados en Auth0")
public ResponseEntity<?> listUsers() {
    try {
        ManagementAPI api = clientProvider.getManagementAPI();
        UsersPage users = api.users().list(null).execute();
        return ResponseEntity.ok(users.getItems());
    } catch (Auth0Exception e) {
        log.error("Error listando usuarios: {}", e.getMessage());
        return ResponseEntity.internalServerError().body(e.getMessage());
    }
}

// --- 🔹 Listar roles ---
@GetMapping("/roles")
@Operation(summary = "Lista todos los roles configurados en Auth0")
public ResponseEntity<?> listRoles() {
    try {
        ManagementAPI api = clientProvider.getManagementAPI();
        RolesPage roles = api.roles().list(null).execute();
        return ResponseEntity.ok(roles.getItems());
    } catch (Auth0Exception e) {
        log.error("Error listando roles: {}", e.getMessage());
        return ResponseEntity.internalServerError().body(e.getMessage());
    }
}


    // --- 1️⃣ Crear usuario ---
    @PostMapping("/users")
    @Operation(summary = "Crea un nuevo usuario en Auth0 con email, password y username")
    public ResponseEntity<?> createUser(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String username
    ) {
        try {
            ManagementAPI api = clientProvider.getManagementAPI();

            User user = new User("Username-Password-Authentication");
            user.setEmail(email);
            user.setPassword(password);
            user.setUsername(username);
            user.setEmailVerified(false);

            User created = api.users().create(user).execute();
            return ResponseEntity.ok(created);
        } catch (Auth0Exception e) {
            log.error("Error creando usuario: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    // --- 2️⃣ Asignar rol a usuario ---
    @PostMapping("/users/{userId}/roles")
    @Operation(summary = "Asigna un rol a un usuario existente en Auth0")
    public ResponseEntity<?> assignRoleToUser(@PathVariable String userId, @RequestParam String roleId) {
        try {
            ManagementAPI api = clientProvider.getManagementAPI();
            api.users().addRoles(userId, List.of(roleId)).execute();
            return ResponseEntity.ok("Rol asignado correctamente al usuario " + userId);
        } catch (Auth0Exception e) {
            log.error("Error asignando rol: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    // --- 3️⃣ Verificar autenticación real ---
    @GetMapping("/verify")
    @Operation(summary = "Verifica que la API esté autenticada correctamente contra Auth0")
    public ResponseEntity<?> verifyAuth() {
        try {
            ManagementAPI api = clientProvider.getManagementAPI();
            RolesPage roles = api.roles().list(null).execute();
            return ResponseEntity.ok("✅ Conexión válida con Auth0. Roles disponibles: " + roles.getItems().size());
        } catch (Auth0Exception e) {
            log.error("Error verificando autenticación: {}", e.getMessage());
            return ResponseEntity.status(401).body("❌ No autenticado con Auth0: " + e.getMessage());
        }
    }




        // --- 🔹 Listar organizaciones ---
        @GetMapping("/organizations")
        @Operation(summary = "Lista todas las organizaciones registradas en Auth0")
        public ResponseEntity<?> listOrganizations() {
            try {
                ManagementAPI api = clientProvider.getManagementAPI();
                var orgs = api.organizations().list(null).execute();
                return ResponseEntity.ok(orgs.getItems());
            } catch (Auth0Exception e) {
                log.error("Error listando organizaciones: {}", e.getMessage());
                return ResponseEntity.internalServerError().body(e.getMessage());
            }
        }





}