package uao.edu.co.scouts_project.organigrama.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subgroup")
@Builder
@NoArgsConstructor
public class Subgroup {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subgroup_id")
    private Long subgroupId;
    
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
    
    @Column(name = "group_id", nullable = false)
    private Long groupId;
    
    @Column(name = "section_id", nullable = false)
    private Long sectionId;
    
    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "photo_principal")
    private UUID photoPrincipal;
    
    // TODO: GALERÍA DE FOTOS - Funcionalidad temporalmente deshabilitada
    // @JdbcTypeCode(SqlTypes.ARRAY)
    // @Column(name = "gallery_object_id", columnDefinition = "uuid[]")
    // private UUID[] galleryObjectIds; // Sin inicializar
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    // Explicit constructors with initialization logic
    public Subgroup(String tenantId, Long groupId, Long sectionId, String name) {
        this.tenantId = tenantId;
        this.groupId = groupId;
        this.sectionId = sectionId;
        this.name = name;
        this.isActive = true;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }
    
    public Subgroup(Long subgroupId, String tenantId, Long groupId, Long sectionId, 
                    String name, String description, UUID photoPrincipal, 
                    Boolean isActive, Instant createdAt, Instant updatedAt) {
        this.subgroupId = subgroupId;
        this.tenantId = tenantId;
        this.groupId = groupId;
        this.sectionId = sectionId;
        this.name = name;
        this.description = description;
        this.photoPrincipal = photoPrincipal;
        this.isActive = isActive != null ? isActive : true;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }
    
    // JPA lifecycle hooks for default values
    @PrePersist
    protected void onCreate() {
        if (isActive == null) {
            isActive = true;
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
    
    // Getters and Setters
    public Long getSubgroupId() { return subgroupId; }
    public void setSubgroupId(Long subgroupId) { this.subgroupId = subgroupId; }
    
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    
    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UUID getPhotoPrincipal() { return photoPrincipal; }
    public void setPhotoPrincipal(UUID photoPrincipal) { this.photoPrincipal = photoPrincipal; }

    // TODO: GALERÍA DE FOTOS - Getters y setters temporalmente deshabilitados
    // public UUID[] getGalleryObjectIds() { return galleryObjectIds; }
    // public void setGalleryObjectIds(UUID[] galleryObjectIds) { this.galleryObjectIds = galleryObjectIds; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
