package uao.edu.co.scouts_project.application.service;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import uao.edu.co.scouts_project.common.service.SupabaseStorageService;
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
import uao.edu.co.scouts_project.domain.port.ConnectionQueryPort;
import uao.edu.co.scouts_project.domain.port.OrganizationQueryPort;
import uao.edu.co.scouts_project.domain.port.RoleMappingPort;
import uao.edu.co.scouts_project.infrastructure.auth0.Auth0AdminAdapter;
import uao.edu.co.scouts_project.domain.port.PermissionQueryPort; // Added
import uao.edu.co.scouts_project.infrastructure.security.Role;
import uao.edu.co.scouts_project.member.service.IMemberService;
import uao.edu.co.scouts_project.member.service.MemberServiceImp;
// removed unused IGroupService and ITenantService to avoid circular deps

import java.util.Arrays;
import java.util.List;

@Service
public class Auth0ServiceImpl implements IAuth0Service {

    @SuppressWarnings("unused")
    private final MemberServiceImp memberServiceImp_1;


    @SuppressWarnings("unused")
    private final Auth0AdminAdapter auth0AdminAdapter;

    private final Auth0AdminPort adminPort;
    private final RoleMappingPort roleMappingPort;
    private final RoleAssignmentValidator roleAssignmentValidator;
    private final PermissionQueryPort permissionQueryPort; // Added

    // removed: private final IGroupService groupService;
    @SuppressWarnings("unused")
    private final IMemberService memberServiceImp;
    @SuppressWarnings("unused")
    private final SupabaseStorageService supabaseStorageService;


    public Auth0ServiceImpl(Auth0AdminPort adminPort,
        RoleMappingPort roleMappingPort,
        RoleAssignmentValidator roleAssignmentValidator,
        PermissionQueryPort permissionQueryPort, Auth0AdminAdapter auth0AdminAdapter,
        IMemberService memberService,
        SupabaseStorageService supabaseStorageService, MemberServiceImp memberServiceImp_1) {
        this.adminPort = adminPort;
        this.roleMappingPort = roleMappingPort;
        this.roleAssignmentValidator = roleAssignmentValidator;
        this.permissionQueryPort = permissionQueryPort;
        this.auth0AdminAdapter = auth0AdminAdapter;

        this.memberServiceImp = memberService;
        this.supabaseStorageService = supabaseStorageService;
        this.memberServiceImp_1 = memberServiceImp_1;

    }

    @Override
    public CreatedUserDTO createUser(CreateUserCommandDTO cmd) {
        return adminPort.createUser(cmd);
    }

    @Override
    public CreatedUserDTO createUserInConnection(CreateUserCommandDTO cmd, String connectionId) {
        return adminPort.createUserInConnection(cmd, connectionId);
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
                            "Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN");
        }

        // Validar que el rol NO sea administrativo
        List<Role> forbiddenRoles = Arrays.asList(Role.ADMIN_GLOBAL, Role.ADMIN_GRUPO, Role.DEV_SUPPORT);
        if (forbiddenRoles.contains(role)) {
            throw new UnauthorizedRoleAssignmentException(
                    "No está autorizado para asignar roles administrativos. " +
                            "Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN");
        }

        // Validar que el rol esté en la lista de permitidos
        List<Role> allowedRoles = Arrays.asList(
                Role.SCOUT,
                Role.ACUDIENTE,
                Role.TESORERO,
                Role.SCOUTER,
                Role.COMITE_ADMIN);
        if (!allowedRoles.contains(role)) {
            throw new UnauthorizedRoleAssignmentException(
                    "El rol " + roleName + " no está permitido para este endpoint. " +
                            "Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN");
        }

        // Crear el comando base para crear usuario
        CreateUserCommandDTO createCommand = new CreateUserCommandDTO(
                request.getEmail(),
                request.getPassword(),
                request.getUsername());

        // Paso 1: Crear usuario en Auth0
        CreatedUserDTO createdUser = createUser(createCommand);
        String userId = createdUser.getId();

        try {
            // Paso 2: Asociar a la organización del usuario autenticado (usa org_id del
            // JWT)
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
        // Prevent changing own role
        String currentUserId = getCurrentUserIdFromSecurityContext();
        if (currentUserId != null && currentUserId.equals(cmd.getUser_id())) {
            throw new UnauthorizedRoleAssignmentException("No está autorizado para cambiar su propio rol");
        }

        // Validate role from enum with friendly error message
        Role target;
        try {
            target = Role.valueOf(cmd.getNewRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Rol inválido: " + cmd.getNewRole()
                            + ". Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN");
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
            throw new IllegalArgumentException(
                    "La organización especificada no existe o el usuario no pertenece a ella");
        }

        // Enforce single role
        var existing = adminPort.getUserRoleIds(cmd.getUser_id());
        adminPort.removeRoles(cmd.getUser_id(), existing);

        // Map enum Role -> Auth0 roleId (via RoleMappingPort)
        String roleId = roleMappingPort.getAuth0RoleId(target);
        adminPort.assignRole(cmd.getUser_id(), roleId);
    }

    // --- Change role (single-role) for global admin, org comes from body if
    // provided ---
    @Override
    public void changeUserRoleGlobal(UserAuth0ChangeRoleDTO cmd) {
        Role target;
        try {
            target = Role.valueOf(cmd.getNewRole().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Rol inválido: " + cmd.getNewRole() + ". Roles válidos: "
                            + java.util.Arrays.toString(Role.values()));
        }

        // If a specific organizationId is provided, validate membership there
        if (cmd.getOrganizationId() != null && !cmd.getOrganizationId().isBlank()) {
            try {
                adminPort.getUserInOrganization(cmd.getOrganizationId(), cmd.getUser_id());
            } catch (ResourceNotFoundException ex) {
                // Convert to BAD_REQUEST semantics for invalid input context
                throw new IllegalArgumentException(
                        "La organización especificada no existe o el usuario no pertenece a ella");
            }
        }

        // Enforce single role
        var existing = adminPort.getUserRoleIds(cmd.getUser_id());
        adminPort.removeRoles(cmd.getUser_id(), existing);

        String roleId = roleMappingPort.getAuth0RoleId(target);
        adminPort.assignRole(cmd.getUser_id(), roleId);
    }

    private String getCurrentUserIdFromSecurityContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            Object sub = jwtAuth.getToken().getClaims().get("sub");
            return sub != null ? sub.toString() : null;
        }
        return null;
    }

    @Override
    public CreatedUserDTO createUserWithRoleInOrganizationElevated(CreateUserWithRoleCommandDTO request,
            String organizationId) {
        if (!isCurrentUserAdminGlobal()) {
            throw new UnauthorizedRoleAssignmentException(
                    "Solo ADMIN_GLOBAL puede crear usuarios con roles administrativos");
        }
        if (organizationId == null || organizationId.isBlank()) {
            throw new IllegalArgumentException("organizationId es obligatorio");
        }

        // Parsear rol (permitiendo roles administrativos)
        Role role;
        try {
            role = Role.valueOf(String.valueOf(request.getRole()).toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Rol inválido: " + request.getRole());
        }

        // 1) Crear usuario
        CreateUserCommandDTO createCmd = new CreateUserCommandDTO(
                request.getEmail(),
                request.getPassword(),
                request.getUsername());
        CreatedUserDTO created = createUser(createCmd);
        String userId = created.getId();

        // 2) Asociar al organizationId especificado
        addUserToOrganization(organizationId, userId);

        // 3) Asignar rol (incluye ADMIN_GLOBAL/ADMIN_GRUPO si se solicita)
        String roleId = roleMappingPort.getAuth0RoleId(role);
        adminPort.assignRole(userId, roleId);

        return created;
    }

    private boolean isCurrentUserAdminGlobal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null)
            return false;
        return auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN_GLOBAL".equals(a.getAuthority()));
    }

}
