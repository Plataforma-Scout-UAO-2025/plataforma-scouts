package uao.edu.co.scouts_project.application.service;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreateUserWithRoleCommandDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.OrganizationSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.RoleSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserSummaryDTO;
import uao.edu.co.scouts_project.domain.dto.auth0.UserAuth0ChangeRoleDTO; // Added
import uao.edu.co.scouts_project.domain.exception.auth0.UnauthorizedRoleAssignmentException;
import uao.edu.co.scouts_project.domain.exception.auth0.ResourceNotFoundException;
import uao.edu.co.scouts_project.domain.port.Auth0AdminPort;
import uao.edu.co.scouts_project.domain.port.RoleMappingPort;
import uao.edu.co.scouts_project.domain.port.PermissionQueryPort; // Added
import uao.edu.co.scouts_project.infrastructure.security.Role;
// no checked exceptions in service; adapter throws runtime Auth0GatewayException

import java.util.Arrays;
import java.util.List;

/**
 * Implementación de {@link IAuth0Service} siguiendo SOLID:
 * - SRP: orquesta llamadas al puerto de infraestructura sin exponer detalles.
 * - DIP: depende de la abstracción {@link Auth0AdminPort}.
 */
@Service
public class Auth0ServiceImpl implements IAuth0Service {
    // Logger can be added if needed

    private final Auth0AdminPort adminPort;
    private final RoleMappingPort roleMappingPort;
    private final RoleAssignmentValidator roleAssignmentValidator;
    private final PermissionQueryPort permissionQueryPort; // Added

    public Auth0ServiceImpl(Auth0AdminPort adminPort, RoleMappingPort roleMappingPort, 
                           RoleAssignmentValidator roleAssignmentValidator,
                           PermissionQueryPort permissionQueryPort) { // Added
        this.adminPort = adminPort;
        this.roleMappingPort = roleMappingPort;
        this.roleAssignmentValidator = roleAssignmentValidator;
        this.permissionQueryPort = permissionQueryPort; // Added
    }

    @Override
    public CreatedUserDTO createUser(CreateUserCommandDTO cmd) {
        return adminPort.createUser(cmd);
    }

    @Override
    public void assignRole(String userId, String roleId) {
        adminPort.assignRole(userId, roleId);
    }

    @Override
    public void assignRole(String userId, Role role) {
        // Validar si el usuario ya tiene roles
        boolean targetUserHasRoles = adminPort.userHasRoles(userId);
        
        // Validar autorización para asignar este rol
        roleAssignmentValidator.validateRoleAssignment(role, targetUserHasRoles);
        
        // Si pasa la validación, proceder con la asignación
        String auth0RoleId = roleMappingPort.getAuth0RoleId(role);
        adminPort.assignRole(userId, auth0RoleId);
    }

    @Override
    public UserSummaryDTO getUserById(String userId) {
        return adminPort.getUserById(userId);
    }

    @Override
    public List<UserSummaryDTO> listUsers() {
        return adminPort.listUsers();
    }

    @Override
    public List<RoleSummaryDTO> listRoles() {
        return adminPort.listRoles();
    }

    @Override
    public List<OrganizationSummaryDTO> listOrganizations() {
        return adminPort.listOrganizations();
    }

    @Override
    public void addUserToOrganization(String organizationId, String userId) {
        adminPort.addUserToOrganization(organizationId, userId);
    }

    @Override
    public void addUserToOwnOrganization(String userId) {
        adminPort.addUserToOwnOrganization(userId);
    }

    @Override
    public UserSummaryDTO getUserInOrganization(String organizationId, String userId) {
        return adminPort.getUserInOrganization(organizationId, userId);
    }

    @Override
    public CreatedUserDTO createUserWithRole(CreateUserWithRoleCommandDTO request) {
        String roleName = request.getRole().toUpperCase();

        // Convertir string a enum Role
        Role role;
        try {
            role = Role.valueOf(roleName);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                "Rol inválido: " + roleName + ". " +
                "Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN"
            );
        }

        // Validar que el rol NO sea administrativo
        List<Role> forbiddenRoles = Arrays.asList(Role.ADMIN_GLOBAL, Role.ADMIN_GRUPO, Role.DEV_SUPPORT);
        if (forbiddenRoles.contains(role)) {
            throw new UnauthorizedRoleAssignmentException(
                "No está autorizado para asignar roles administrativos. " +
                "Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN"
            );
        }

        // Validar que el rol esté en la lista de permitidos
        List<Role> allowedRoles = Arrays.asList(
            Role.SCOUT, 
            Role.ACUDIENTE, 
            Role.TESORERO, 
            Role.SCOUTER, 
            Role.COMITE_ADMIN
        );
        if (!allowedRoles.contains(role)) {
            throw new UnauthorizedRoleAssignmentException(
                "El rol " + roleName + " no está permitido para este endpoint. " +
                "Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN"
            );
        }

        // Crear el comando base para crear usuario
        CreateUserCommandDTO createCommand = new CreateUserCommandDTO(
            request.getEmail(),
            request.getPassword(),
            request.getUsername()
        );

        // Paso 1: Crear usuario en Auth0
        CreatedUserDTO createdUser = createUser(createCommand);
        String userId = createdUser.getId();

        try {
            // Paso 2: Asociar a la organización del usuario autenticado (usa org_id del JWT)
            addUserToOwnOrganization(userId);

            // Paso 3: Asignar el rol especificado
            assignRole(userId, role);

            return createdUser;

        } catch (Exception ex) {
            // Si falla algún paso posterior a la creación, re-lanzar la excepción
            // El usuario ya fue creado en Auth0
            throw ex;
        }
    }

    // --- Added: change role (single-role) for group admin ---
    @Override
    public void changeUserRole(UserAuth0ChangeRoleDTO cmd) {
        // Validate role from enum with friendly error message
        Role target;
        try {
            target = Role.valueOf(cmd.getNewRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                "Rol inválido: " + cmd.getNewRole() + ". Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN"
            );
        }

        // Forbid admin roles at group scope
        List<Role> forbidden = Arrays.asList(Role.ADMIN_GLOBAL, Role.ADMIN_GRUPO, Role.DEV_SUPPORT);
        if (forbidden.contains(target)) {
            throw new UnauthorizedRoleAssignmentException("No está autorizado para asignar roles administrativos");
        }

        // Validate membership in current org (like createUser uses org_id)
        String orgId = permissionQueryPort.getCurrentUserOrgId();
        if (orgId == null || orgId.isBlank()) {
            throw new IllegalStateException("No se pudo determinar el org_id del token");
        }
        // Throws or returns if user belongs; ensures scope
        try {
            adminPort.getUserInOrganization(orgId, cmd.getUser_id());
        } catch (ResourceNotFoundException ex) {
            // Convert to BAD_REQUEST semantics for invalid input context
            throw new IllegalArgumentException("La organización especificada no existe o el usuario no pertenece a ella");
        }

        // Enforce single role
        var existing = adminPort.getUserRoleIds(cmd.getUser_id());
        adminPort.removeRoles(cmd.getUser_id(), existing);

        // Map enum Role -> Auth0 roleId (via RoleMappingPort)
        String roleId = roleMappingPort.getAuth0RoleId(target);
        adminPort.assignRole(cmd.getUser_id(), roleId);
    }

    // --- Change role (single-role) for global admin, org comes from body if provided ---
    @Override
    public void changeUserRoleGlobal(UserAuth0ChangeRoleDTO cmd) {
        Role target;
        try {
            target = Role.valueOf(cmd.getNewRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                "Rol inválido: " + cmd.getNewRole() + ". Roles válidos: " + java.util.Arrays.toString(Role.values())
            );
        }

        // If a specific organizationId is provided, validate membership there
        if (cmd.getOrganizationId() != null && !cmd.getOrganizationId().isBlank()) {
            try {
                adminPort.getUserInOrganization(cmd.getOrganizationId(), cmd.getUser_id());
            } catch (ResourceNotFoundException ex) {
                // Convert to BAD_REQUEST semantics for invalid input context
                throw new IllegalArgumentException("La organización especificada no existe o el usuario no pertenece a ella");
            }
        }

        // Enforce single role
        var existing = adminPort.getUserRoleIds(cmd.getUser_id());
        adminPort.removeRoles(cmd.getUser_id(), existing);

        String roleId = roleMappingPort.getAuth0RoleId(target);
        adminPort.assignRole(cmd.getUser_id(), roleId);
    }

}
