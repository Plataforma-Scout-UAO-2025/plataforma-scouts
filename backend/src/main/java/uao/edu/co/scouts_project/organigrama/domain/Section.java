package uao.edu.co.scouts_project.organigrama.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "section")
public class Section {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "section_id")
    private Long sectionId;
    
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;
    
    @Column(name = "group_id", nullable = false)
    private Long groupId;
    
    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "icon_object_id")
    private UUID iconObjectId;
    
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "gallery_object_ids", columnDefinition = "uuid[]", nullable = false)
    private java.util.UUID[] galleryObjectIds;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
    
    // Constructors
    public Section() {}
    
    public Section(Long tenantId, Long groupId, String name) {
        this.tenantId = tenantId;
        this.groupId = groupId;
        this.name = name;
    }
    
    // Getters and Setters
    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }
    
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public UUID getIconObjectId() { return iconObjectId; }
    public void setIconObjectId(UUID iconObjectId) { this.iconObjectId = iconObjectId; }
    
    public UUID[] getGalleryObjectIds() { return galleryObjectIds; }
    public void setGalleryObjectIds(UUID[] galleryObjectIds) { this.galleryObjectIds = galleryObjectIds; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
