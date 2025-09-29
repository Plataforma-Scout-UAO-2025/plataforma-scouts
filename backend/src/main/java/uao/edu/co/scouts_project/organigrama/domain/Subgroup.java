package uao.edu.co.scouts_project.organigrama.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "subgroups")
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
    @Column(name = "subgroup_name", nullable = false)
    private String subgroupName;
    
    @Column(name = "subgroup_description")
    private String subgroupDescription;
    
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "subgroup_gallery_object_ids", columnDefinition = "uuid[]", nullable = false)
    private java.util.UUID[] subgroupGalleryObjectIds;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
    
    // Constructors
    public Subgroup() {}
    
    public Subgroup(Long tenantId, Long groupId, Long sectionId, String subgroupName) {
        this.tenantId = tenantId;
        this.groupId = groupId;
        this.sectionId = sectionId;
        this.subgroupName = subgroupName;
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
    
    public String getSubgroupName() { return subgroupName; }
    public void setSubgroupName(String subgroupName) { this.subgroupName = subgroupName; }
    
    public String getSubgroupDescription() { return subgroupDescription; }
    public void setSubgroupDescription(String subgroupDescription) { this.subgroupDescription = subgroupDescription; }
    
    public UUID[] getSubgroupGalleryObjectIds() { return subgroupGalleryObjectIds; }
    public void setSubgroupGalleryObjectIds(UUID[] subgroupGalleryObjectIds) { this.subgroupGalleryObjectIds = subgroupGalleryObjectIds; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
