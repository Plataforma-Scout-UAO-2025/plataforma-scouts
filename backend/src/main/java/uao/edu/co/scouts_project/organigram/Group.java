package uao.edu.co.scouts_project.organigram;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "groups")
@Getter
@Setter
@Builder
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long groupId;

    @NotNull
    @Column(nullable = false)
    private String slug;

    @NotNull
    @Column(nullable = false)
    private String name;

    private String district;

    @Column(name = "identifier_number")
    private String identifierNumber;

    private String address;
    private String phone;

    @Email
    private String email;

    @Column(name = "founded_in")
    private LocalDate foundedIn;

    private String motto;
    private String mission;
    private String vision;
    private String history;
    private String status;

    @Column(name = "logo_object_id")
    private UUID logoObjectId;

    @Column(name = "scarf_object_id")
    private UUID scarfObjectId;

    @Type(JsonType.class)
    @Column(name = "social_links", columnDefinition = "jsonb")
    private Map<String, Object> socialLinks;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> config;

    @Column(name = "is_active")
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @NotNull
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
}
