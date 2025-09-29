package uao.edu.co.scouts_project.organigrama.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sections")
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
    @Column(name = "section_name", nullable = false)
    private String sectionName;
    
    @Column(name = "section_description")
    private String sectionDescription;
    
    @Column(name = "section_icon_object_id")
    private UUID sectionIconObjectId;
    
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "section_gallery_object_ids", columnDefinition = "uuid[]", nullable = false)
    private java.util.UUID[] sectionGalleryObjectIds;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
    
    // Constructors
    public Section() {}
    
    public Section(Long tenantId, Long groupId, String sectionName) {
        this.tenantId = tenantId;
        this.groupId = groupId;
        this.sectionName = sectionName;
    }
    
    // Getters and Setters
    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }
    
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    
    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }
    
    public String getSectionDescription() { return sectionDescription; }
    public void setSectionDescription(String sectionDescription) { this.sectionDescription = sectionDescription; }
    
    public UUID getSectionIconObjectId() { return sectionIconObjectId; }
    public void setSectionIconObjectId(UUID sectionIconObjectId) { this.sectionIconObjectId = sectionIconObjectId; }
    
    public UUID[] getSectionGalleryObjectIds() { return sectionGalleryObjectIds; }
    public void setSectionGalleryObjectIds(UUID[] sectionGalleryObjectIds) { this.sectionGalleryObjectIds = sectionGalleryObjectIds; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
