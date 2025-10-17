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
import uao.edu.co.scouts_project.domain.exception.auth0.UnauthorizedRoleAssignmentException;
import uao.edu.co.scouts_project.domain.port.Auth0AdminPort;
import uao.edu.co.scouts_project.domain.port.RoleMappingPort;
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

    public Auth0ServiceImpl(Auth0AdminPort adminPort, RoleMappingPort roleMappingPort, 
                           RoleAssignmentValidator roleAssignmentValidator) {
        this.adminPort = adminPort;
        this.roleMappingPort = roleMappingPort;
        this.roleAssignmentValidator = roleAssignmentValidator;
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
        // Validar que el rol no sea administrativo
        String roleName = request.getRole().toUpperCase();
        
        // Lista de roles administrativos que NO se pueden asignar
        List<String> forbiddenRoles = Arrays.asList("ADMIN_GLOBAL", "ADMIN_GRUPO", "DEV_SUPPORT");
        
        if (forbiddenRoles.contains(roleName)) {
            throw new UnauthorizedRoleAssignmentException(
                "No está autorizado para asignar roles administrativos. " +
                "Roles permitidos: SCOUT, ACUDIENTE, TESORERO, SCOUTER, COMITE_ADMIN"
            );
        }

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

}
