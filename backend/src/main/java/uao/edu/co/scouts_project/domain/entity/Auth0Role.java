package uao.edu.co.scouts_project.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad que mapea roles de Auth0 con los roles internos de la plataforma.
 * Tabla: auth0_roles
 */
@Entity
@Table(name = "auth0_roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Auth0Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "auth0_rol", nullable = false, unique = true)
    private String auth0RoleId;

    @Column(name = "nombre", nullable = false, unique = true)
    private String roleName;

    public Auth0Role(String auth0RoleId, String roleName) {
        this.auth0RoleId = auth0RoleId;
        this.roleName = roleName;
    }
}
