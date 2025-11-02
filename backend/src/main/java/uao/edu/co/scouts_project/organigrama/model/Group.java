package uao.edu.co.scouts_project.organigrama.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Data
@Entity
@Table(name = "groups")
public class Group {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long groupId;
    
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
    
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
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "status")
    private String status;
    
    // Constructors
    public Group() {
        // Dejar que @PrePersist inicialice los campos
    }
    
    public Group(String tenantId, String slug, String name) {
        this.tenantId = tenantId;
        this.slug = slug;
        this.name = name;
    }

    @PrePersist
    public void prePersist() {
        if (this.socialLinks == null) this.socialLinks = new HashMap<>();
        if (this.config == null) this.config = new HashMap<>();
        if (this.isActive == null) this.isActive = Boolean.TRUE;
    }

    @PreUpdate
    public void preUpdate() {
        if (this.socialLinks == null) this.socialLinks = new HashMap<>();
        if (this.config == null) this.config = new HashMap<>();
    }


    
}