package uao.edu.co.scouts_project.organigrama.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.dao.EmptyResultDataAccessException;

import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.UpdatingGroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.repository.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;
import uao.edu.co.scouts_project.organigrama.model.Group;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class GroupServiceTest {

    private static final String TENANT_ID = "T1";
    private static final String SLUG = "centinelas-113";

    @Mock
    private GroupRepository groupRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private SupabaseStorageService storageService;

    @InjectMocks
    private GroupService groupService;

    private Group entity;

    @SuppressWarnings("unused")
    private GroupDTO newDto() {
        return new GroupDTO(
                null, // 1 groupId
                TENANT_ID, // 2 tenantId
                SLUG, // 3 slug
                "Grupo Scout Centinelas 113", // 4 name
                null, // 5 district
                null, // 6 identifierNumber
                null, // 7 address
                null, // 8 phone
                null, // 9 email
                null, // 10 foundedIn
                null, // 11 motto
                null, // 12 mission
                null, // 13 vision
                null, // 14 history
                null, // 15 logoObjectId
                null, // 16 scarfObjectId
                Map.<String, Object>of(), // 17 socialLinks
                Map.<String, Object>of(), // 18 config
                Boolean.TRUE, // 19 isActive
                "ACTIVE", // 20 status
                null, // 21 createdAt
                null // 22 updatedAt
        );
    }

    @BeforeEach
    void init() {
        when(tenantRepository.existsById(TENANT_ID)).thenReturn(true);

        entity = new Group(TENANT_ID, SLUG, "Grupo Scout Centinelas 113");
        entity.setGroupId(1L);
        entity.setFoundedIn(LocalDate.of(1998, 1, 1));
        entity.setIsActive(true);

        // Stubs de storage omitidos: la implementación maneja nulls/colecciones vacías
    }

    // ---------- CREATE ----------
    @Test
    @DisplayName("createGroup: guarda y devuelve respuesta cuando el slug no existe")
    void create_ok() {
        when(groupRepository.existsByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG))).thenReturn(false);
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> {
            Group g = inv.getArgument(0);
            g.setGroupId(1L);
            return g;
        });

        GroupResponseDTO out = groupService.createGroup(TENANT_ID, newDto());

        assertThat(out).isNotNull();
        assertThat(out.groupId()).isEqualTo(1L);
        assertThat(out.slug()).isEqualTo(SLUG);
        assertThat(out.name()).isEqualTo("Grupo Scout Centinelas 113");

            verify(groupRepository).existsByTenantIdAndSlug(TENANT_ID, SLUG);
        verify(groupRepository).save(any(Group.class));
    }

    @Test
    @DisplayName("createGroup: lanza IllegalArgumentException si el slug ya existe")
    void create_conflict_whenSlugExists() {
        when(groupRepository.existsByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG))).thenReturn(true);

        assertThatThrownBy(() -> groupService.createGroup(TENANT_ID, newDto()))
                .isInstanceOf(IllegalArgumentException.class);

        verify(groupRepository).existsByTenantIdAndSlug(TENANT_ID, SLUG);
        verify(groupRepository, never()).save(any());
    }

    @Test
    @DisplayName("createGroup: lanza IllegalArgumentException si el slug tiene formato inválido")
    void create_invalid_slug_format() {
        final GroupDTO invalidDto = new GroupDTO(
            null, TENANT_ID, "Slug Inválido!", "Nombre", 
            null, null, null, null, null, null, null, null, null, null,
            null, null, Map.of(), Map.of(), true, "ACTIVE", null, null
        );

        assertThatThrownBy(() -> groupService.createGroup(TENANT_ID, invalidDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Slug inválido");

        verify(groupRepository, never()).save(any());
    }

    @Test
    @DisplayName("createGroup: permite crear múltiples grupos en un tenant")
    void create_multiple_groups_same_tenant() {
            when(groupRepository.existsByTenantIdAndSlug(eq(TENANT_ID), anyString())).thenReturn(false);
        when(groupRepository.save(any(Group.class))).thenReturn(entity);

        GroupDTO firstGroup = newDto();
        GroupDTO secondGroup = new GroupDTO(
            null, TENANT_ID, "otro-grupo", "Otro Grupo",
            null, null, null, null, null, null, null, null, null, null,
            null, null, Map.of(), Map.of(), true, "ACTIVE", null, null
        );

        groupService.createGroup(TENANT_ID, firstGroup);
        groupService.createGroup(TENANT_ID, secondGroup);

        verify(groupRepository, times(2)).save(any(Group.class));
    }

    @Test
    @DisplayName("createGroup: lanza IllegalArgumentException si el slug es null")
    void create_null_slug() {
        final GroupDTO nullSlugDto = new GroupDTO(
            null, TENANT_ID, null, "Nombre",
            null, null, null, null, null, null, null, null, null, null,
            null, null, Map.of(), Map.of(), true, "ACTIVE", null, null
        );

        assertThatThrownBy(() -> groupService.createGroup(TENANT_ID, nullSlugDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("El slug no puede estar vacío");

        verify(groupRepository, never()).save(any());
    }

    // ---------- GET BY SLUG ----------
    @Test
    @DisplayName("getGroupBySlug: devuelve detalle cuando existe")
    void getBySlug_ok() {
        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));

        GroupResponseDTO out = groupService.getGroupBySlug(TENANT_ID, SLUG);

        assertThat(out).isNotNull();
        assertThat(out.groupId()).isEqualTo(1L);
        assertThat(out.slug()).isEqualTo(SLUG);
        assertThat(out.name()).isEqualTo("Grupo Scout Centinelas 113");

        verify(groupRepository).findByTenantIdAndSlug(TENANT_ID, SLUG);
    }


    @Test
    @DisplayName("updateGroup (UpdatingGroupDTO): lanza IllegalArgumentException si se intenta cambiar el slug")
    void update_with_updatingDto_slug_conflict() {
        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
            .thenReturn(Optional.of(entity));

        UpdatingGroupDTO dto = new UpdatingGroupDTO();
        dto.setSlug("nuevo-slug");

        assertThatThrownBy(() -> groupService.updateGroup(TENANT_ID, SLUG, dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("El campo slug es inmutable");

        verify(groupRepository).findByTenantIdAndSlug(TENANT_ID, SLUG);
        verify(groupRepository, never()).existsByTenantIdAndSlug(anyString(), anyString());
        verify(groupRepository, never()).save(any());
    }
    @Test
    @DisplayName("getGroupBySlug: incluye URLs públicas cuando existen imágenes")
    void getBySlug_includesUrls() {
        UUID logoId = UUID.randomUUID();
        UUID scarfId = UUID.randomUUID();
        entity.setLogoObjectId(logoId);
        entity.setScarfObjectId(scarfId);

        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));
        when(storageService.getPublicUrlsFromObjectIds(eq(Set.of(logoId, scarfId))))
                .thenReturn(Map.of(logoId, "logo-url", scarfId, "scarf-url"));

        GroupResponseDTO out = groupService.getGroupBySlug(TENANT_ID, SLUG);

        assertThat(out.logoObjectUrl()).isEqualTo("logo-url");
        assertThat(out.scarfObjectUrl()).isEqualTo("scarf-url");
        verify(storageService).getPublicUrlsFromObjectIds(Set.of(logoId, scarfId));
    }

    @Test
    @DisplayName("getGroupBySlug: lanza IllegalArgumentException cuando no existe")
    void getBySlug_notFound() {
        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> groupService.getGroupBySlug(TENANT_ID, SLUG))
                .isInstanceOf(IllegalArgumentException.class);

        verify(groupRepository).findByTenantIdAndSlug(TENANT_ID, SLUG);
    }

    // ---------- UPDATE (PATCH) ----------
    @Test
    @DisplayName("updateGroup: actualiza atributos permitidos")
    void update_group_allowed_fields() {
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, SLUG))
            .thenReturn(Optional.of(entity));
        when(groupRepository.save(any(Group.class))).thenReturn(entity);

        GroupDTO updateDto = new GroupDTO(
            null, TENANT_ID, SLUG, "Nuevo Nombre",
            "Distrito Nuevo", "123", "Nueva Dirección", "123456", "nuevo@email.com",
            LocalDate.now(), "Nuevo Lema", "Nueva Misión", "Nueva Visión", "Nueva Historia",
            null, null, Map.of("facebook", "newfb"), Map.of("color", "blue"), 
            true, "ACTIVE", null, null
        );

        GroupResponseDTO updated = groupService.updateGroup(TENANT_ID, SLUG, updateDto);

        assertThat(updated.name()).isEqualTo("Nuevo Nombre");
        verify(groupRepository).save(any(Group.class));
    }

    @Test
    @DisplayName("updateGroup: no permite modificar slug")
    void update_group_immutable_slug() {
            Group existingGroup = new Group(TENANT_ID, SLUG, "Grupo Scout Centinelas 113");
            existingGroup.setGroupId(1L);

        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, SLUG))
                .thenReturn(Optional.of(existingGroup));

        GroupDTO updateDto = new GroupDTO(
            null, TENANT_ID, "nuevo-slug", "Nombre", 
            null, null, null, null, null, null, null, null, null, null,
            null, null, Map.of(), Map.of(), true, "ACTIVE", null, null
        );

        assertThatThrownBy(() -> groupService.updateGroup(TENANT_ID, SLUG, updateDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("slug es inmutable");

        verify(groupRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateGroup: no permite modificar tenantId")
    void update_group_immutable_tenantId() {
            Group existingGroup = new Group(TENANT_ID, SLUG, "Grupo Scout Centinelas 113");
            existingGroup.setGroupId(1L);

        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, SLUG))
                .thenReturn(Optional.of(existingGroup));

        GroupDTO updateDto = new GroupDTO(
            null, "otro-tenant", SLUG, "Nombre",
            null, null, null, null, null, null, null, null, null, null,
            null, null, Map.of(), Map.of(), true, "ACTIVE", null, null
        );

        assertThatThrownBy(() -> groupService.updateGroup(TENANT_ID, SLUG, updateDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("tenantId es inmutable");

        verify(groupRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateGroup: ignora el slug cuando es null")
    void update_group_ignores_null_slug() {
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, SLUG))
            .thenReturn(Optional.of(entity));
        when(groupRepository.save(any(Group.class))).thenReturn(entity);

        GroupDTO updateDto = new GroupDTO(
            null, TENANT_ID, null, "Nuevo Nombre", 
            null, null, null, null, null, null, null, null, null, null,
            null, null, Map.of(), Map.of(), true, "ACTIVE", null, null
        );

        GroupResponseDTO updated = groupService.updateGroup(TENANT_ID, SLUG, updateDto);

        assertThat(updated.slug()).isEqualTo(SLUG);  // El slug no debe cambiar
        assertThat(updated.name()).isEqualTo("Nuevo Nombre");  // Otros campos sí se actualizan
        verify(groupRepository).save(any(Group.class));
    }

    @Test
    @DisplayName("updateGroup: permite activar/desactivar grupo")
    void update_group_active_status() {
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, SLUG))
            .thenReturn(Optional.of(entity));
        when(groupRepository.save(any(Group.class))).thenReturn(entity);

        // Desactivar
        GroupDTO deactivateDto = newDto();
        deactivateDto = new GroupDTO(
            null, TENANT_ID, SLUG, "Nombre",
            null, null, null, null, null, null, null, null, null, null,
            null, null, Map.of(), Map.of(), false, "INACTIVE", null, null
        );

        GroupResponseDTO updated = groupService.updateGroup(TENANT_ID, SLUG, deactivateDto);
        assertThat(updated.isActive()).isFalse();
        assertThat(updated.status()).isEqualTo("INACTIVE");

        verify(groupRepository, times(1)).save(any(Group.class));
    }

    // ---------- LIST ----------
    @Test
    @DisplayName("getGroupsByTenant: devuelve lista para el tenant")
    void listByTenant_ok() {
        Group e2 = new Group(TENANT_ID, "g2", "G2");
        e2.setGroupId(2L);
        e2.setIsActive(true);

        when(storageService.getPublicUrlsFromObjectIds(any())).thenReturn(Map.of());
        when(groupRepository.findByTenantId(eq(TENANT_ID)))
                .thenReturn(List.of(entity, e2));

        List<GroupResponseDTO> out = groupService.getGroupsByTenant(TENANT_ID);

        assertThat(out).hasSize(2);
        assertThat(out).extracting(GroupResponseDTO::slug)
                .containsExactlyInAnyOrder(SLUG, "g2");

        verify(groupRepository).findByTenantId(TENANT_ID);
        verify(storageService).getPublicUrlsFromObjectIds(any());
    }

    @Test
    @DisplayName("getGroupsByTenant: reusa URLs públicas de una sola llamada")
    void listByTenant_includesUrlsAndDeduplicates() {
        UUID logo1 = UUID.randomUUID();
        UUID scarfShared = UUID.randomUUID();
        UUID logo2 = UUID.randomUUID();

        Group g1 = new Group(TENANT_ID, SLUG, "G1");
        g1.setGroupId(1L);
        g1.setLogoObjectId(logo1);
        g1.setScarfObjectId(scarfShared);

        Group g2 = new Group(TENANT_ID, "g2", "G2");
        g2.setGroupId(2L);
        g2.setLogoObjectId(logo2);
        g2.setScarfObjectId(scarfShared);

        when(groupRepository.findByTenantId(eq(TENANT_ID)))
                .thenReturn(List.of(g1, g2));
        when(storageService.getPublicUrlsFromObjectIds(
                argThat(ids -> ids.containsAll(Set.of(logo1, scarfShared, logo2)) && ids.size() == 3)))
                .thenReturn(Map.of(
                        logo1, "logo1-url",
                        scarfShared, "scarf-url",
                        logo2, "logo2-url"));

        List<GroupResponseDTO> out = groupService.getGroupsByTenant(TENANT_ID);

        assertThat(out).hasSize(2);
        GroupResponseDTO primary = out.stream().filter(dto -> dto.slug().equals(SLUG)).findFirst().orElseThrow();
        GroupResponseDTO secondary = out.stream().filter(dto -> dto.slug().equals("g2")).findFirst().orElseThrow();

        assertThat(primary.logoObjectUrl()).isEqualTo("logo1-url");
        assertThat(primary.scarfObjectUrl()).isEqualTo("scarf-url");
        assertThat(secondary.logoObjectUrl()).isEqualTo("logo2-url");
        assertThat(secondary.scarfObjectUrl()).isEqualTo("scarf-url");

        verify(storageService).getPublicUrlsFromObjectIds(any());
    }

    // ---------- UPDATE ----------
    @Test
    @DisplayName("updateGroup: actualiza campos y devuelve respuesta")
    void update_ok() {
        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));

        GroupDTO patch = new GroupDTO(
                1L, // groupId
                TENANT_ID, // tenantId
                SLUG, // slug
                "Grupo Actualizado", // name
                null, // district
                null, // identifierNumber
                null, // address
                null, // phone
                null, // email
                null, // foundedIn
                null, // motto
                null, // mission
                null, // vision
                null, // history
                null, // logoObjectId (UUID)
                null, // scarfObjectId (UUID)
                Map.of(), // socialLinks
                Map.of(), // config
                Boolean.FALSE, // isActive
                "ACTIVE", // status
                null, // createdAt
                null // updatedAt
        );

        GroupResponseDTO out = groupService.updateGroup(TENANT_ID, SLUG, patch);

        assertThat(out).isNotNull();
        assertThat(out.name()).isEqualTo("Grupo Actualizado");
        assertThat(out.isActive()).isFalse();

        verify(groupRepository).findByTenantIdAndSlug(TENANT_ID, SLUG);
        verify(groupRepository).save(any(Group.class));
    }

    @Test
    @DisplayName("updateGroup: elimina archivos anteriores cuando cambian logo o pañolón")
    void updateGroup_replacesImages() {
        UUID oldLogo = UUID.randomUUID();
        UUID oldScarf = UUID.randomUUID();
        UUID newLogo = UUID.randomUUID();
        UUID newScarf = UUID.randomUUID();

        entity.setLogoObjectId(oldLogo);
        entity.setScarfObjectId(oldScarf);

        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));

        GroupDTO patch = new GroupDTO(
                1L,
                TENANT_ID,
                SLUG,
                "Grupo Actualizado",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                newLogo,
                newScarf,
                Map.of(),
                Map.of(),
                Boolean.TRUE,
                "ACTIVE",
                null,
                null);

        GroupResponseDTO out = groupService.updateGroup(TENANT_ID, SLUG, patch);

        assertThat(out.logoObjectUrl()).isNull();
        assertThat(out.scarfObjectUrl()).isNull();
        assertThat(entity.getLogoObjectId()).isEqualTo(newLogo);
        assertThat(entity.getScarfObjectId()).isEqualTo(newScarf);

        verify(storageService).deleteFileByObjectId(oldLogo);
        verify(storageService).deleteFileByObjectId(oldScarf);
        verify(groupRepository).save(entity);
    }

    @Test
    @DisplayName("updateGroup: lanza IllegalArgumentException cuando no existe el grupo")
    void update_notFound() {
        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.empty());

        GroupDTO patch = new GroupDTO(
                1L, // groupId
                TENANT_ID, // tenantId
                SLUG, // slug
                "Grupo Actualizado", // name
                null, // district
                null, // identifierNumber
                null, // address
                null, // phone
                null, // email
                null, // foundedIn
                null, // motto
                null, // mission
                null, // vision
                null, // history
                null, // logoObjectId (UUID)
                null, // scarfObjectId (UUID)
                Map.of(), // socialLinks
                Map.of(), // config
                Boolean.FALSE, // isActive
                "ACTIVE", // status
                null, // createdAt
                null // updatedAt
        );

        assertThatThrownBy(() -> groupService.updateGroup(TENANT_ID, SLUG, patch))
                .isInstanceOf(IllegalArgumentException.class);

        verify(groupRepository).findByTenantIdAndSlug(TENANT_ID, SLUG);
        verify(groupRepository, never()).save(any());
    }

    // ---------- DELETE ----------

    @Test
    void deleteGroup_shouldDeleteGroupAndAssociatedFiles_whenGroupExistsWithFiles() {
        // Arrange
        long groupId = 1L;
        UUID logoId = UUID.randomUUID();
        UUID scarfId = UUID.randomUUID();

        Group group = new Group();
        group.setLogoObjectId(logoId);
        group.setScarfObjectId(scarfId);

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));

        // Act
        String result = groupService.deleteGroup(groupId);

        // Assert
        verify(storageService).deleteFileByObjectId(logoId);
        verify(storageService).deleteFileByObjectId(scarfId);
        verify(groupRepository).deleteById(groupId);

        assertEquals("Grupo con ID: " + groupId + " ha sido eliminado.", result);
    }

    @Test
    void deleteGroup_shouldDeleteGroupWithoutFiles_whenGroupExistsWithoutFiles() {
        // Arrange
        Long groupId = 2L;
        Group group = new Group();
        group.setLogoObjectId(null);
        group.setScarfObjectId(null);

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));

        // Act
        String result = groupService.deleteGroup(groupId);

        // Assert
        verify(storageService, never()).deleteFileByObjectId(any());
        verify(groupRepository).deleteById(groupId);
        assertEquals("Grupo con ID: " + groupId + " ha sido eliminado.", result);
    }

    @Test
    void deleteGroup_shouldReturnMessage_whenGroupDoesNotExist() {
        // Arrange
        Long groupId = 3L;
        when(groupRepository.findById(groupId)).thenReturn(Optional.empty());

        // Act
        String result = groupService.deleteGroup(groupId);

        // Assert
        verify(storageService, never()).deleteFileByObjectId(any());
        verify(groupRepository, never()).deleteById(any());
        assertEquals("Grupo con ID: " + groupId + " no existe.", result);
    }

    @Test
    @DisplayName("deleteLogoImage: elimina logo cuando existe")
    void deleteLogoImage_whenPresent() {
        UUID logoId = UUID.randomUUID();
        entity.setLogoObjectId(logoId);

        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));

        groupService.deleteLogoImage(TENANT_ID, SLUG);

        assertThat(entity.getLogoObjectId()).isNull();
        verify(storageService).deleteFileByObjectId(logoId);
        verify(groupRepository).save(entity);
    }

    @Test
    @DisplayName("deleteLogoImage: ignora cuando no hay logo")
    void deleteLogoImage_whenEmpty() {
        entity.setLogoObjectId(null);

        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));

        groupService.deleteLogoImage(TENANT_ID, SLUG);

        verify(storageService, never()).deleteFileByObjectId(any());
        verify(groupRepository, never()).save(any());
    }

    @Test
    @DisplayName("deleteScarfImage: elimina pañolón cuando existe")
    void deleteScarfImage_whenPresent() {
        UUID scarfId = UUID.randomUUID();
        entity.setScarfObjectId(scarfId);

        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));

        groupService.deleteScarfImage(TENANT_ID, SLUG);

        assertThat(entity.getScarfObjectId()).isNull();
        verify(storageService).deleteFileByObjectId(scarfId);
        verify(groupRepository).save(entity);
    }

    @Test
    @DisplayName("deleteScarfImage: ignora cuando no hay pañolón")
    void deleteScarfImage_whenEmpty() {
        entity.setScarfObjectId(null);

        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));

        groupService.deleteScarfImage(TENANT_ID, SLUG);

        verify(storageService, never()).deleteFileByObjectId(any());
        verify(groupRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateLogo: reemplaza y elimina logo anterior")
    void updateLogo_whenDifferent() {
        UUID oldLogo = UUID.randomUUID();
        UUID newLogo = UUID.randomUUID();
        entity.setLogoObjectId(oldLogo);

        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));

        groupService.updateLogo(TENANT_ID, SLUG, newLogo);

        assertThat(entity.getLogoObjectId()).isEqualTo(newLogo);
        verify(storageService).deleteFileByObjectId(oldLogo);
        verify(groupRepository).save(entity);
    }

    @Test
    @DisplayName("updateLogo: no elimina cuando es el mismo objectId")
    void updateLogo_whenSame() {
        UUID logo = UUID.randomUUID();
        entity.setLogoObjectId(logo);

        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));

        groupService.updateLogo(TENANT_ID, SLUG, logo);

        assertThat(entity.getLogoObjectId()).isEqualTo(logo);
        verify(storageService, never()).deleteFileByObjectId(any());
        verify(groupRepository).save(entity);
    }

    @Test
    @DisplayName("updateScarf: reemplaza y elimina pañolón anterior")
    void updateScarf_whenDifferent() {
        UUID oldScarf = UUID.randomUUID();
        UUID newScarf = UUID.randomUUID();
        entity.setScarfObjectId(oldScarf);

        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));

        groupService.updateScarf(TENANT_ID, SLUG, newScarf);

        assertThat(entity.getScarfObjectId()).isEqualTo(newScarf);
        verify(storageService).deleteFileByObjectId(oldScarf);
        verify(groupRepository).save(entity);
    }

    @Test
    @DisplayName("updateScarf: no elimina cuando es el mismo objectId")
    void updateScarf_whenSame() {
        UUID scarf = UUID.randomUUID();
        entity.setScarfObjectId(scarf);

        when(groupRepository.findByTenantIdAndSlug(eq(TENANT_ID), eq(SLUG)))
                .thenReturn(Optional.of(entity));
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));

        groupService.updateScarf(TENANT_ID, SLUG, scarf);

        assertThat(entity.getScarfObjectId()).isEqualTo(scarf);
        verify(storageService, never()).deleteFileByObjectId(any());
        verify(groupRepository).save(entity);
    }
}
