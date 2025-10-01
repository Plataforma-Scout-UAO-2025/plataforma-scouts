package uao.edu.co.scouts_project.organigrama.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "subgroup")
public class Subgroup {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subgroup_id")
    private Long subgroupId;
    
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;
    
    @Column(name = "group_id", nullable = false)
    private Long groupId;
    
    @Column(name = "section_id", nullable = false)
    private Long sectionId;
    
    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "gallery_object_id", columnDefinition = "uuid[]")
    private UUID[] galleryObjectIds = new UUID[0]; // Inicializar con array vacío
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
    
    // Constructors
    public Subgroup() {}
    
    public Subgroup(Long tenantId, Long groupId, Long sectionId, String name) {
        this.tenantId = tenantId;
        this.groupId = groupId;
        this.sectionId = sectionId;
        this.name = name;
    }
    
    // Getters and Setters
    public Long getSubgroupId() { return subgroupId; }
    public void setSubgroupId(Long subgroupId) { this.subgroupId = subgroupId; }
    
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    
    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UUID[] getGalleryObjectIds() { return galleryObjectIds; }
    public void setGalleryObjectIds(UUID[] galleryObjectIds) { this.galleryObjectIds = galleryObjectIds; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
