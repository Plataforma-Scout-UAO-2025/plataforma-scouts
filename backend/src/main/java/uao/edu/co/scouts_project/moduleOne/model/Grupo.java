package uao.edu.co.scouts_project.moduleOne.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

/**
 * Entidad Grupo - Representa un grupo dentro de un tenant scout
 * Cada grupo pertenece a un tenant y puede tener múltiples miembros
 */
@Entity
@Table(name = "grupos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"tenant", "miembros"}) // Evita recursión infinita en toString
public class Grupo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grupo_id")
    private Long grupoId;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(name = "tipo_grupo", length = 50)
    private String tipoGrupo; // Ej: "Manada", "Tropa", "Clan", etc.

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    /**
     * Relación ManyToOne con Tenant
     * Muchos grupos pueden pertenecer a un tenant
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    /**
     * Relación ManyToMany con Miembro
     * Un grupo puede tener múltiples miembros y un miembro puede estar en múltiples grupos
     */
    @ManyToMany(mappedBy = "grupos", fetch = FetchType.LAZY)
    private Set<Miembro> miembros = new HashSet<>();

    /**
     * Constructor con parámetros básicos
     */
    public Grupo(String nombre, String descripcion, String tipoGrupo, Tenant tenant) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tipoGrupo = tipoGrupo;
        this.tenant = tenant;
        this.activo = true;
        this.miembros = new HashSet<>();
    }

    /**
     * Método de utilidad para agregar un miembro
     */
    public void addMiembro(Miembro miembro) {
        miembros.add(miembro);
        miembro.getGrupos().add(this);
    }

    /**
     * Método de utilidad para remover un miembro
     */
    public void removeMiembro(Miembro miembro) {
        miembros.remove(miembro);
        miembro.getGrupos().remove(this);
    }

    /**
     * Getter personalizado para obtener el número de miembros
     */
    public int getCantidadMiembros() {
        return miembros != null ? miembros.size() : 0;
    }
}