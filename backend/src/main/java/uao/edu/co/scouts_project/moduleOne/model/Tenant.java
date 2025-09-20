package uao.edu.co.scouts_project.moduleOne.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

/**
 * Entidad Tenant - Representa una organización o grupo scout principal
 * Cada tenant puede tener múltiples grupos y miembros
 */
@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"grupos", "miembros"}) // Evita recursión infinita en toString
public class Tenant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tenant_id")
    private Long tenantId;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    /**
     * Relación OneToMany con Grupo
     * Un tenant puede tener múltiples grupos
     */
    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Grupo> grupos = new HashSet<>();

    /**
     * Relación OneToMany con Miembro
     * Un tenant puede tener múltiples miembros
     */
    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Miembro> miembros = new HashSet<>();

    /**
     * Constructor con parámetros básicos
     */
    public Tenant(String nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.activo = true;
        this.grupos = new HashSet<>();
        this.miembros = new HashSet<>();
    }

    /**
     * Método de utilidad para agregar un grupo
     */
    public void addGrupo(Grupo grupo) {
        grupos.add(grupo);
        grupo.setTenant(this);
    }

    /**
     * Método de utilidad para remover un grupo
     */
    public void removeGrupo(Grupo grupo) {
        grupos.remove(grupo);
        grupo.setTenant(null);
    }

    /**
     * Método de utilidad para agregar un miembro
     */
    public void addMiembro(Miembro miembro) {
        miembros.add(miembro);
        miembro.setTenant(this);
    }

    /**
     * Método de utilidad para remover un miembro
     */
    public void removeMiembro(Miembro miembro) {
        miembros.remove(miembro);
        miembro.setTenant(null);
    }
}