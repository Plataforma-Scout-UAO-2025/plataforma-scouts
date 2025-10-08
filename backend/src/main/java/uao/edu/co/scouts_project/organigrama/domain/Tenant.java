package uao.edu.co.scouts_project.organigrama.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "tenant")
public class Tenant {
    
    @Id
    @Column(name = "tenant_id")
    private String tenantId;
    
    @NotBlank
    @Column(name = "slug", nullable = false, unique = true)
    private String slug;
    
    @Column(name = "status", nullable = false)
    private String status = "active";
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
    
    // Constructors
    public Tenant() {}
    
    public Tenant(String slug) {
        this.slug = slug;
    }
    
    // Getters and Setters
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}