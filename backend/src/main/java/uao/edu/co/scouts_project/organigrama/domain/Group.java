package uao.edu.co.scouts_project.organigrama.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "groups")
public class Group {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long groupId;
    
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;
    
    @NotBlank
    @Column(name = "slug", nullable = false)
    private String slug;
    
    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "district")
    private String district;
    
    @Column(name = "identifier_number")
    private String identifierNumber;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "founded_in")
    private LocalDate foundedIn;
    
    @Column(name = "motto")
    private String motto;
    
    @Column(name = "mission")
    private String mission;
    
    @Column(name = "vision")
    private String vision;
    
    @Column(name = "history")
    private String history;
    
    @Column(name = "logo_object_id")
    private java.util.UUID logoObjectId;
    
    @Column(name = "scarf_object_id")
    private java.util.UUID scarfObjectId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "social_links", columnDefinition = "jsonb")
    private Map<String, Object> socialLinks;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config", columnDefinition = "jsonb")
    private Map<String, Object> config;
    
    @Column(name = "is_active")
    private Boolean isActive;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "status")
    private String status;
    
    // Constructors
    public Group() {
        // Dejar que @PrePersist inicialice los campos
    }
    
    public Group(Long tenantId, String slug, String name) {
        this.tenantId = tenantId;
        this.slug = slug;
        this.name = name;
    }

    @PrePersist
    public void prePersist() {
        if (this.socialLinks == null) {
            this.socialLinks = new HashMap<>();
        }
        if (this.config == null) {
            this.config = new HashMap<>();
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        // @UpdateTimestamp se encarga del updatedAt automáticamente
        if (this.socialLinks == null) {
            this.socialLinks = new HashMap<>();
        }
        if (this.config == null) {
            this.config = new HashMap<>();
        }
    }

    // Getters and Setters
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    
    public String getIdentifierNumber() { return identifierNumber; }
    public void setIdentifierNumber(String identifierNumber) { this.identifierNumber = identifierNumber; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public LocalDate getFoundedIn() { return foundedIn; }
    public void setFoundedIn(LocalDate foundedIn) { this.foundedIn = foundedIn; }
    
    public String getMotto() { return motto; }
    public void setMotto(String motto) { this.motto = motto; }
    
    public String getMission() { return mission; }
    public void setMission(String mission) { this.mission = mission; }
    
    public String getVision() { return vision; }
    public void setVision(String vision) { this.vision = vision; }
    
    public String getHistory() { return history; }
    public void setHistory(String history) { this.history = history; }
    
    public UUID getLogoObjectId() { return logoObjectId; }
    public void setLogoObjectId(UUID logoObjectId) { this.logoObjectId = logoObjectId; }
    
    public UUID getScarfObjectId() { return scarfObjectId; }
    public void setScarfObjectId(UUID scarfObjectId) { this.scarfObjectId = scarfObjectId; }
    
    public Map<String, Object> getSocialLinks() { 
        return socialLinks != null ? socialLinks : new HashMap<>(); 
    }
    public void setSocialLinks(Map<String, Object> socialLinks) { 
        this.socialLinks = socialLinks != null ? socialLinks : new HashMap<>(); 
    }

    public Map<String, Object> getConfig() { 
        return config != null ? config : new HashMap<>(); 
    }
    public void setConfig(Map<String, Object> config) { 
        this.config = config != null ? config : new HashMap<>(); 
    }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}