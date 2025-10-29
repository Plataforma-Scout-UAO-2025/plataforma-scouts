package uao.edu.co.scouts_project.organigrama.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "tenant")
public class Tenant {

    @Id
    @Column(name = "tenant_id")
    private String tenantId;

    @NotBlank
    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_at", nullable = true, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = true)
    private Instant updatedAt;

    // Constructor con slug - genera tenantId automáticamente
    public Tenant(String slug) {
        this.tenantId = "t-" + slug; // Generación automática del ID
        this.slug = slug;
        this.status = "active"; // Valor por defecto
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Constructor completo con tenantId y slug
    public Tenant(String tenantId, String slug) {
        this.tenantId = tenantId;
        this.slug = slug;
        this.status = "active"; // Valor por defecto
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Constructor completo con status personalizado
    public Tenant(String tenantId, String slug, String status) {
        this.tenantId = tenantId;
        this.slug = slug;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Hook JPA para timestamps automáticos
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
        if (status == null) {
            status = "active";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

}