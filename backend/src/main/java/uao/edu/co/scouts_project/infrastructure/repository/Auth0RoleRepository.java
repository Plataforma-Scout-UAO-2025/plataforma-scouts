package uao.edu.co.scouts_project.infrastructure.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uao.edu.co.scouts_project.domain.entity.Auth0Role;

import java.util.Optional;

/**
 * Repositorio para consultar la tabla auth0_roles.
 */
@Repository
public interface Auth0RoleRepository extends JpaRepository<Auth0Role, Long> {

    /**
     * Busca un rol de Auth0 por su nombre interno (ej: "ACUDIENTE", "ADMIN_GRUPO").
     */
    Optional<Auth0Role> findByRoleName(String roleName);

    /**
     * Busca un rol por su ID de Auth0 (ej: "rol_913piBxHkGe0MxC3").
     */
    Optional<Auth0Role> findByAuth0RoleId(String auth0RoleId);
}
