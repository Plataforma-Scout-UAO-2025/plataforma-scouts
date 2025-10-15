package uao.edu.co.scouts_project.member.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO que representa un miembro con la información completa de su subgrupo y sección.
 * Se utiliza para listar miembros con toda la información organizacional necesaria.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberWithSubgroupAndSectionDto {

    // Member information
    @JsonProperty("memberId")
    private Long memberId;

    @JsonProperty("userId")
    private String userId;

    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("guardianId")
    private Integer guardianId;

    @JsonProperty("firstName")
    private String firstName;

    @JsonProperty("lastName")
    private String lastName;

    private Integer age;

    private String role;

    private String identification;

    @JsonProperty("documentType")
    private DocumentType documentType;

    private String email;

    private String gender;

    @JsonProperty("birthDate")
    private LocalDate birthDate;

    private String address;

    private String phone;

    private String weight;

    private String height;

    private String hobbies;

    private String sports;

    private String instruments;

    @JsonProperty("isActive")
    private Boolean isActive;

    private Status status;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    // Subgroup information
    @JsonProperty("subgroup")
    private SubgroupInfo subgroup;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubgroupInfo {
        @JsonProperty("subgroupId")
        private Long subgroupId;

        @JsonProperty("tenantId")
        private String tenantId;

        @JsonProperty("groupId")
        private Long groupId;

        @JsonProperty("sectionId")
        private Long sectionId;

        private String name;

        private String description;

        @JsonProperty("photoPrincipal")
        private UUID photoPrincipal;

        @JsonProperty("isActive")
        private Boolean isActive;

        @JsonProperty("createdAt")
        private Instant createdAt;

        @JsonProperty("updatedAt")
        private Instant updatedAt;

        // Section information nested within subgroup
        @JsonProperty("section")
        private SectionInfo section;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SectionInfo {
        @JsonProperty("sectionId")
        private Long sectionId;

        @JsonProperty("tenantId")
        private String tenantId;

        @JsonProperty("groupId")
        private Long groupId;

        private String name;

        private String description;

        @JsonProperty("iconObjectId")
        private UUID iconObjectId;

        @JsonProperty("photoPrincipal")
        private UUID photoPrincipal;

        @JsonProperty("galleryObjectIds")
        private UUID[] galleryObjectIds;

        @JsonProperty("createdAt")
        private Instant createdAt;

        @JsonProperty("updatedAt")
        private Instant updatedAt;
    }
}
