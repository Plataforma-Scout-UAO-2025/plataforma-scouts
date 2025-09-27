package uao.edu.co.scouts_project.organigrama.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "tenants")
public class Tenant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tenant_id")
    private Long tenantId;
    
    @NotBlank
    @Column(name = "slug", nullable = false, unique = true)
    private String slug;
    
    @Column(name = "status", nullable = false)
    private Boolean status = true;
    
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
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    
    public Boolean getStatus() { return status; }
    public void setStatus(Boolean status) { this.status = status; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}