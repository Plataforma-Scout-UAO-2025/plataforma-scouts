package uao.edu.co.scouts_project.organigrama.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;

class OrganigramaDtoTest {

    @Test
    void groupDtoShouldExposeValues() {
        UUID logo = UUID.randomUUID();
        UUID scarf = UUID.randomUUID();
        Map<String, Object> socialLinks = Map.of("instagram", "@scouts");
        Map<String, Object> config = Map.of("theme", "dark");
        LocalDateTime createdAt = LocalDateTime.now().minusDays(1);
        LocalDateTime updatedAt = LocalDateTime.now();

        GroupDTO dto = new GroupDTO(
            42L,
            "tenant-1",
            "centinelas",
            "Grupo Centinelas",
            "Distrito Valle",
            "ID-900",
            "Cra 7 #12-34",
            "+57 3000000000",
            "info@scouts.co",
            LocalDate.of(1990, 5, 12),
            "Siempre listos",
            "Servir",
            "Liderazgo",
            "Historia Scout",
            logo,
            scarf,
            socialLinks,
            config,
            Boolean.TRUE,
            "ACTIVE",
            createdAt,
            updatedAt
        );

        assertThat(dto.groupId()).isEqualTo(42L);
        assertThat(dto.tenantId()).isEqualTo("tenant-1");
        assertThat(dto.slug()).isEqualTo("centinelas");
        assertThat(dto.name()).isEqualTo("Grupo Centinelas");
        assertThat(dto.district()).isEqualTo("Distrito Valle");
        assertThat(dto.identifierNumber()).isEqualTo("ID-900");
        assertThat(dto.address()).isEqualTo("Cra 7 #12-34");
        assertThat(dto.phone()).isEqualTo("+57 3000000000");
        assertThat(dto.email()).isEqualTo("info@scouts.co");
        assertThat(dto.foundedIn()).isEqualTo(LocalDate.of(1990, 5, 12));
        assertThat(dto.motto()).isEqualTo("Siempre listos");
        assertThat(dto.mission()).isEqualTo("Servir");
        assertThat(dto.vision()).isEqualTo("Liderazgo");
        assertThat(dto.history()).isEqualTo("Historia Scout");
        assertThat(dto.logoObjectId()).isEqualTo(logo);
        assertThat(dto.scarfObjectId()).isEqualTo(scarf);
        assertThat(dto.socialLinks()).containsEntry("instagram", "@scouts");
        assertThat(dto.config()).containsEntry("theme", "dark");
        assertThat(dto.isActive()).isTrue();
        assertThat(dto.status()).isEqualTo("ACTIVE");
        assertThat(dto.createdAt()).isEqualTo(createdAt);
        assertThat(dto.updatedAt()).isEqualTo(updatedAt);
    }

    @Test
    void groupResponseDtoShouldSupportEqualityAndExposeUrls() {
        Map<String, Object> social = Map.of("instagram", "@centinelas");
        Map<String, Object> config = Map.of("color", "green");
        LocalDateTime createdAt = LocalDateTime.now().minusDays(2);
        LocalDateTime updatedAt = LocalDateTime.now();

        GroupResponseDTO first = new GroupResponseDTO(
            7L,
            "tenant-2",
            "guardianes",
            "Guardianes",
            "Distrito Norte",
            "ID-100",
            "Calle 10",
            "555-1234",
            "contacto@guardianes.co",
            LocalDate.of(1985, 3, 1),
            "Siempre alerta",
            "Proteger",
            "Inspirar",
            "Historia",
            "https://cdn/logo.png",
            "https://cdn/scarf.png",
            social,
            config,
            Boolean.FALSE,
            "INACTIVE",
            createdAt,
            updatedAt
        );

        GroupResponseDTO second = new GroupResponseDTO(
            7L,
            "tenant-2",
            "guardianes",
            "Guardianes",
            "Distrito Norte",
            "ID-100",
            "Calle 10",
            "555-1234",
            "contacto@guardianes.co",
            LocalDate.of(1985, 3, 1),
            "Siempre alerta",
            "Proteger",
            "Inspirar",
            "Historia",
            "https://cdn/logo.png",
            "https://cdn/scarf.png",
            social,
            config,
            Boolean.FALSE,
            "INACTIVE",
            createdAt,
            updatedAt
        );

        assertThat(first).isEqualTo(second);
        assertThat(first.hashCode()).isEqualTo(second.hashCode());
        assertThat(first.logoObjectUrl()).isEqualTo("https://cdn/logo.png");
        assertThat(first.scarfObjectUrl()).isEqualTo("https://cdn/scarf.png");
        assertThat(first.socialLinks()).containsKey("instagram");
        assertThat(first.config()).containsEntry("color", "green");
    }

    @Test
    void sectionDtoShouldHandleGalleryArray() {
        UUID[] gallery = {UUID.randomUUID(), UUID.randomUUID()};
        Instant createdAt = Instant.now().minusSeconds(3600);
        Instant updatedAt = Instant.now();

        SectionDTO dto = new SectionDTO(
            11L,
            "tenant-3",
            21L,
            "Manada",
            "Niños entre 7 y 11 años",
            UUID.randomUUID(),
            UUID.randomUUID(),
            gallery,
            createdAt,
            updatedAt
        );

        assertThat(dto.sectionId()).isEqualTo(11L);
    assertThat(dto.galleryObjectIds()).containsExactly(gallery[0], gallery[1]);
        assertThat(dto.createdAt()).isEqualTo(createdAt);
        assertThat(dto.updatedAt()).isEqualTo(updatedAt);
    }

    @Test
    void sectionResponseDtoShouldExposeGalleryItems() {
        UUID iconUuid = UUID.randomUUID();
        SectionResponseDTO.GalleryItemDTO galleryItem = new SectionResponseDTO.GalleryItemDTO(iconUuid, "https://cdn/items/" + iconUuid);
        List<SectionResponseDTO.GalleryItemDTO> gallery = List.of(galleryItem);
        Instant createdAt = Instant.now().minusSeconds(7200);
        Instant updatedAt = Instant.now();

        SectionResponseDTO dto = new SectionResponseDTO(
            12L,
            "tenant-4",
            22L,
            "Tropa",
            "Adolescentes",
            UUID.fromString("ffffffff-ffff-ffff-ffff-ffffffffffff"), "https://cdn/icon.png",
            UUID.fromString("12345678-1234-1234-1234-123456789abc"), "https://cdn/photo.png",
            List.of("https://legacy/image.png"),
            gallery,
            createdAt,
            updatedAt
        );

        assertThat(dto.gallery()).containsExactly(galleryItem);
        assertThat(dto.galleryObjectUrls()).containsExactly("https://legacy/image.png");
        assertThat(dto.iconObjectUrl()).isEqualTo("https://cdn/icon.png");
        assertThat(dto.photoPrincipalUrl()).isEqualTo("https://cdn/photo.png");
    }

    @Test
    void subgroupDtoShouldExposeLifecycleFields() {
        Instant createdAt = Instant.now().minusSeconds(1000);
        Instant updatedAt = Instant.now();
        UUID photo = UUID.randomUUID();

        SubgroupDTO dto = new SubgroupDTO(
            31L,
            "tenant-5",
            41L,
            51L,
            "Clan",
            "Jóvenes mayores",
            photo,
            Boolean.TRUE,
            createdAt,
            updatedAt
        );

        assertThat(dto.subgroupId()).isEqualTo(31L);
        assertThat(dto.photoPrincipal()).isEqualTo(photo);
        assertThat(dto.isActive()).isTrue();
        assertThat(dto.createdAt()).isEqualTo(createdAt);
        assertThat(dto.updatedAt()).isEqualTo(updatedAt);
    }

    @Test
    void subgroupResponseDtoShouldExposeUrlFields() {
        Instant createdAt = Instant.now().minusSeconds(2000);
        Instant updatedAt = Instant.now();

        SubgroupResponseDTO dto = new SubgroupResponseDTO(
            32L,
            "tenant-6",
            42L,
            52L,
            "Clan",
            "Descripción",
            UUID.fromString("87654321-4321-4321-4321-cba987654321"), "https://cdn/photos/principal.png",
            Boolean.FALSE,
            createdAt,
            updatedAt
        );

        assertThat(dto.photoPrincipalUrl()).isEqualTo("https://cdn/photos/principal.png");
        assertThat(dto.isActive()).isFalse();
        assertThat(dto.createdAt()).isEqualTo(createdAt);
        assertThat(dto.updatedAt()).isEqualTo(updatedAt);
    }

    @Test
    void tenantDtoShouldExposeAuditInformation() {
        Instant createdAt = Instant.now().minusSeconds(5000);
        Instant updatedAt = Instant.now();

        TenantDTO dto = new TenantDTO(
            "tenant-7",
            "scouts-co",
            "ACTIVE",
            createdAt,
            updatedAt
        );

        assertThat(dto.tenantId()).isEqualTo("tenant-7");
        assertThat(dto.slug()).isEqualTo("scouts-co");
        assertThat(dto.status()).isEqualTo("ACTIVE");
        assertThat(dto.createdAt()).isEqualTo(createdAt);
        assertThat(dto.updatedAt()).isEqualTo(updatedAt);
    }

    @Test
    void galleryPatchRequestShouldExposeOperations() {
        UUID target = UUID.randomUUID();
        UUID newValue = UUID.randomUUID();

        GalleryPatchRequest.PatchOperation operation = new GalleryPatchRequest.PatchOperation(
            "replace",
            target,
            newValue
        );

        GalleryPatchRequest request = new GalleryPatchRequest(List.of(operation));

        assertThat(request.operations()).containsExactly(operation);
        assertThat(operation.op()).isEqualTo("replace");
        assertThat(operation.targetUuid()).isEqualTo(target);
        assertThat(operation.newValue()).isEqualTo(newValue);
    }

    @Test
    void updateImageRequestShouldExposeObjectId() {
        UUID objectId = UUID.randomUUID();
        UpdateImageRequest request = new UpdateImageRequest(objectId);

        assertThat(request.objectId()).isEqualTo(objectId);
    }
}
