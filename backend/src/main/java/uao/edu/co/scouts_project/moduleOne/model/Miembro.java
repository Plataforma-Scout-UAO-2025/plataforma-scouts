package uao.edu.co.scouts_project.moduleOne.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Entidad Miembro - Representa un miembro scout dentro de un tenant
 * Cada miembro pertenece a un tenant y puede estar en múltiples grupos
 */
@Entity
@Table(name = "miembros")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"tenant", "grupos"}) // Evita recursión infinita en toString
public class Miembro {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "miembro_id")
    private Long miembroId;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "email", nullable = false, length = 150, unique = true)
    private String email;

    @Column(name = "apellido", length = 100)
    private String apellido;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "documento_identidad", length = 50)
    private String documentoIdentidad;

    @Column(name = "tipo_miembro", length = 50)
    private String tipoMiembro; // Ej: "Scout", "Dirigente", "Padre de familia", etc.

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    /**
     * Relación ManyToOne con Tenant
     * Muchos miembros pueden pertenecer a un tenant
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    /**
     * Relación ManyToMany con Grupo
     * Un miembro puede estar en múltiples grupos y un grupo puede tener múltiples miembros
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "miembro_grupo",
        joinColumns = @JoinColumn(name = "miembro_id"),
        inverseJoinColumns = @JoinColumn(name = "grupo_id")
    )
    private Set<Grupo> grupos = new HashSet<>();

    /**
     * Constructor con parámetros básicos
     */
    public Miembro(String nombre, String apellido, String email, Tenant tenant) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.tenant = tenant;
        this.activo = true;
        this.grupos = new HashSet<>();
    }

    /**
     * Constructor completo para inicialización
     */
    public Miembro(String nombre, String apellido, String email, String telefono, 
                   LocalDate fechaNacimiento, String documentoIdentidad, 
                   String tipoMiembro, Tenant tenant) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.documentoIdentidad = documentoIdentidad;
        this.tipoMiembro = tipoMiembro;
        this.tenant = tenant;
        this.activo = true;
        this.grupos = new HashSet<>();
    }

    /**
     * Método de utilidad para agregar a un grupo
     */
    public void addGrupo(Grupo grupo) {
        grupos.add(grupo);
        grupo.getMiembros().add(this);
    }

    /**
     * Método de utilidad para remover de un grupo
     */
    public void removeGrupo(Grupo grupo) {
        grupos.remove(grupo);
        grupo.getMiembros().remove(this);
    }

    /**
     * Método de utilidad para obtener el nombre completo
     */
    public String getNombreCompleto() {
        return nombre + (apellido != null ? " " + apellido : "");
    }

    /**
     * Getter personalizado para obtener el número de grupos
     */
    public int getCantidadGrupos() {
        return grupos != null ? grupos.size() : 0;
    }
}