package uao.edu.co.scouts_project.organigrama.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Entity
@Data
@AllArgsConstructor
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
    
 
}