package uao.edu.co.scouts_project.guardian.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subgroup")
@Builder
@Getter
@Setter
@AllArgsConstructor
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

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
