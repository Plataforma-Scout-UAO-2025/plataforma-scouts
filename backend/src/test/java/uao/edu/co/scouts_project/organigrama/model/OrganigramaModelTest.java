package uao.edu.co.scouts_project.organigrama.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;

class OrganigramaModelTest {

    @Test
    void groupPrePersistShouldInitializeDefaults() {
        Group group = new Group("tenant-1", "centinelas", "Grupo Centinelas");
        group.setIsActive(null);

        group.prePersist();

        assertThat(group.getSocialLinks()).isNotNull().isEmpty();
        assertThat(group.getConfig()).isNotNull().isEmpty();
        assertThat(group.getIsActive()).isTrue();
    }

    @Test
    void groupPreUpdateShouldPreserveMutableMaps() {
        Group group = new Group();

        group.preUpdate();
        group.getSocialLinks().put("instagram", "@scouts");
        group.getConfig().put("theme", "dark");

        assertThat(group.getSocialLinks()).containsEntry("instagram", "@scouts");
        assertThat(group.getConfig()).containsEntry("theme", "dark");
    }

    @Test
    void groupSettersShouldStoreValues() {
        UUID logo = UUID.randomUUID();
        UUID scarf = UUID.randomUUID();
        Map<String, Object> socialLinks = new HashMap<>();
        socialLinks.put("facebook", "scouts");
        Map<String, Object> config = new HashMap<>();
        config.put("color", "green");

        Group group = new Group();
        group.setGroupId(99L);
        group.setTenantId("tenant-2");
        group.setSlug("guardianes");
        group.setName("Guardianes");
        group.setDistrict("Distrito Norte");
        group.setIdentifierNumber("ID-123");
        group.setAddress("Calle 10");
        group.setPhone("555-4321");
        group.setEmail("contacto@guardianes.co");
        group.setFoundedIn(LocalDate.of(2000, 1, 1));
        group.setMotto("Siempre alerta");
        group.setMission("Proteger");
        group.setVision("Inspirar");
        group.setHistory("Historia scout");
        group.setLogoObjectId(logo);
        group.setScarfObjectId(scarf);
        group.setSocialLinks(socialLinks);
        group.setConfig(config);
        group.setIsActive(Boolean.FALSE);
        group.setStatus("INACTIVE");

        assertThat(group.getGroupId()).isEqualTo(99L);
        assertThat(group.getTenantId()).isEqualTo("tenant-2");
        assertThat(group.getSlug()).isEqualTo("guardianes");
        assertThat(group.getName()).isEqualTo("Guardianes");
        assertThat(group.getDistrict()).isEqualTo("Distrito Norte");
        assertThat(group.getIdentifierNumber()).isEqualTo("ID-123");
        assertThat(group.getAddress()).isEqualTo("Calle 10");
        assertThat(group.getPhone()).isEqualTo("555-4321");
        assertThat(group.getEmail()).isEqualTo("contacto@guardianes.co");
        assertThat(group.getFoundedIn()).isEqualTo(LocalDate.of(2000, 1, 1));
        assertThat(group.getMotto()).isEqualTo("Siempre alerta");
        assertThat(group.getMission()).isEqualTo("Proteger");
        assertThat(group.getVision()).isEqualTo("Inspirar");
        assertThat(group.getHistory()).isEqualTo("Historia scout");
        assertThat(group.getLogoObjectId()).isEqualTo(logo);
        assertThat(group.getScarfObjectId()).isEqualTo(scarf);
        assertThat(group.getSocialLinks()).containsEntry("facebook", "scouts");
        assertThat(group.getConfig()).containsEntry("color", "green");
        assertThat(group.getIsActive()).isFalse();
        assertThat(group.getStatus()).isEqualTo("INACTIVE");
    }

    @Test
    void sectionConstructorShouldInitializeEmptyGallery() {
        Section section = new Section("tenant-3", 10L, "Manada");

        assertThat(section.getTenantId()).isEqualTo("tenant-3");
        assertThat(section.getGroupId()).isEqualTo(10L);
        assertThat(section.getName()).isEqualTo("Manada");
        assertThat(section.getGalleryObjectIds()).isNotNull().isEmpty();
    }

    @Test
    void sectionSettersShouldStoreValues() {
        UUID icon = UUID.randomUUID();
        UUID photo = UUID.randomUUID();
        UUID[] gallery = {UUID.randomUUID(), UUID.randomUUID()};
        Instant createdAt = Instant.now().minusSeconds(1000);
        Instant updatedAt = Instant.now();

        Section section = new Section();
        section.setSectionId(501L);
        section.setTenantId("tenant-4");
        section.setGroupId(601L);
        section.setName("Tropa");
        section.setDescription("Adolescentes");
        section.setIconObjectId(icon);
        section.setPhotoPrincipal(photo);
        section.setGalleryObjectIds(gallery);
        section.setCreatedAt(createdAt);
        section.setUpdatedAt(updatedAt);

        assertThat(section.getSectionId()).isEqualTo(501L);
        assertThat(section.getDescription()).isEqualTo("Adolescentes");
        assertThat(section.getIconObjectId()).isEqualTo(icon);
        assertThat(section.getPhotoPrincipal()).isEqualTo(photo);
        assertThat(section.getGalleryObjectIds()).containsExactly(gallery[0], gallery[1]);
        assertThat(section.getCreatedAt()).isEqualTo(createdAt);
        assertThat(section.getUpdatedAt()).isEqualTo(updatedAt);
    }

    @Test
    void subgroupDefaultsShouldBeInitialized() {
        Subgroup subgroup = new Subgroup("tenant-5", 701L, 801L, "Clan");

        assertThat(subgroup.getTenantId()).isEqualTo("tenant-5");
        assertThat(subgroup.getGroupId()).isEqualTo(701L);
        assertThat(subgroup.getSectionId()).isEqualTo(801L);
        assertThat(subgroup.getName()).isEqualTo("Clan");
        assertThat(subgroup.getIsActive()).isTrue();
        assertThat(subgroup.getCreatedAt()).isNotNull();
        assertThat(subgroup.getUpdatedAt()).isNotNull();
    }

    @Test
    void subgroupSettersShouldStoreValues() {
        UUID photo = UUID.randomUUID();
        Instant createdAt = Instant.now().minusSeconds(5000);
        Instant updatedAt = Instant.now();

        Subgroup subgroup = new Subgroup();
        subgroup.setSubgroupId(901L);
        subgroup.setTenantId("tenant-6");
        subgroup.setGroupId(902L);
        subgroup.setSectionId(903L);
        subgroup.setName("Clan Fénix");
        subgroup.setDescription("Juventud");
        subgroup.setPhotoPrincipal(photo);
        subgroup.setIsActive(Boolean.FALSE);
        subgroup.setCreatedAt(createdAt);
        subgroup.setUpdatedAt(updatedAt);

        assertThat(subgroup.getSubgroupId()).isEqualTo(901L);
        assertThat(subgroup.getDescription()).isEqualTo("Juventud");
        assertThat(subgroup.getPhotoPrincipal()).isEqualTo(photo);
        assertThat(subgroup.getIsActive()).isFalse();
        assertThat(subgroup.getCreatedAt()).isEqualTo(createdAt);
        assertThat(subgroup.getUpdatedAt()).isEqualTo(updatedAt);
    }

    @Test
    void tenantDefaultsShouldBeInitialized() {
        Tenant tenant = new Tenant("scouts-co");

        assertThat(tenant.getSlug()).isEqualTo("scouts-co");
        assertThat(tenant.getStatus()).isEqualTo("active");
        assertThat(tenant.getCreatedAt()).isNotNull();
        assertThat(tenant.getUpdatedAt()).isNotNull();
    }

    @Test
    void tenantSettersShouldStoreValues() {
        Instant createdAt = Instant.now().minusSeconds(4000);
        Instant updatedAt = Instant.now();

        Tenant tenant = new Tenant();
        tenant.setTenantId("tenant-7");
        tenant.setSlug("scouts-latam");
        tenant.setStatus("INACTIVE");
        tenant.setCreatedAt(createdAt);
        tenant.setUpdatedAt(updatedAt);

        assertThat(tenant.getTenantId()).isEqualTo("tenant-7");
        assertThat(tenant.getSlug()).isEqualTo("scouts-latam");
        assertThat(tenant.getStatus()).isEqualTo("INACTIVE");
        assertThat(tenant.getCreatedAt()).isEqualTo(createdAt);
        assertThat(tenant.getUpdatedAt()).isEqualTo(updatedAt);
    }
}
