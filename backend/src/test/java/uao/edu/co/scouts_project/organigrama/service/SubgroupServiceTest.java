package uao.edu.co.scouts_project.organigrama.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.Arguments;

import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.model.Group;
import uao.edu.co.scouts_project.organigrama.model.Section;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;
import uao.edu.co.scouts_project.organigrama.model.Tenant;
import uao.edu.co.scouts_project.organigrama.repository.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repository.SubgroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;

import java.lang.reflect.Method;
import java.time.Instant;
import java.util.*;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubgroupServiceTest {

    private static final String TENANT_ID   = "tenant-demo";
    private static final String GROUP_SLUG  = "centinelas-113";
    private static final Long   GROUP_ID    = 42L;
    private static final Long   SECTION_ID  = 100L;
    private static final Long   SUB_ID      = 10L;

    @Mock SubgroupRepository subgroupRepository;
    @Mock SectionRepository  sectionRepository;
    @Mock GroupRepository    groupRepository;
    @Mock TenantRepository   tenantRepository;
    @Mock SupabaseStorageService storageService;

    @InjectMocks SubgroupService service;

    // Entidades "ligeras" mockeadas para validar jerarquía
    private Tenant tenant;
    private Group  group;
    private Section section;

    @BeforeEach
    void setup() {
    tenant = mock(Tenant.class);
    lenient().when(tenant.getTenantId()).thenReturn(TENANT_ID);
    lenient().when(tenantRepository.existsById(TENANT_ID)).thenReturn(true);

        group = mock(Group.class);
        lenient().when(group.getGroupId()).thenReturn(GROUP_ID);
        lenient().when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));

        section = mock(Section.class);
        lenient().when(section.getGroupId()).thenReturn(GROUP_ID);
        lenient().when(sectionRepository.findById(SECTION_ID)).thenReturn(Optional.of(section));

    }

    private Subgroup makeEntity(String name, UUID photo) {
        Subgroup s = new Subgroup(TENANT_ID, GROUP_ID, SECTION_ID, name);
        s.setSubgroupId(SUB_ID);
        s.setDescription(name + " desc");
        s.setPhotoPrincipal(photo);
        s.setIsActive(true);
        s.setCreatedAt(Instant.parse("2024-01-01T00:00:00Z"));
        s.setUpdatedAt(Instant.parse("2024-01-02T00:00:00Z"));
        return s;
    }

    // ---------- getSubgroupsBySection ----------
    @Test
    @DisplayName("getSubgroupsBySection: lista con URLs resueltas")
    void list_ok() {
        UUID p1 = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        UUID p2 = UUID.fromString("123e4567-e89b-12d3-a456-426614174111");

        when(subgroupRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, GROUP_ID, SECTION_ID))
            .thenReturn(List.of(makeEntity("Panteras", p1), makeEntity("Tigres", p2)));

        when(storageService.getPublicUrlsFromObjectIds(argThat(set -> set.containsAll(Set.of(p1, p2)))))
            .thenReturn(Map.of(p1, "url:p1", p2, "url:p2"));

    List<SubgroupResponseDTO> out = service.getSubgroupsBySection(TENANT_ID, GROUP_SLUG, SECTION_ID);

        assertThat(out).hasSize(2);
        assertThat(out).extracting(SubgroupResponseDTO::name).containsExactlyInAnyOrder("Panteras", "Tigres");
        assertThat(out).extracting(SubgroupResponseDTO::photoPrincipalUrl).containsExactlyInAnyOrder("url:p1", "url:p2");
    }

    // ---------- getSubgroupById ----------
    @Test
    @DisplayName("getSubgroupById: detalle con URL de foto principal")
    void getById_ok() {
        UUID p = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        when(subgroupRepository.findById(SUB_ID)).thenReturn(Optional.of(makeEntity("Panteras", p)));
        when(storageService.getPublicUrlsFromObjectIds(Set.of(p))).thenReturn(Map.of(p, "url:p"));

    SubgroupResponseDTO out = service.getSubgroupById(TENANT_ID, GROUP_SLUG, SECTION_ID, SUB_ID);

        assertThat(out.subgroupId()).isEqualTo(SUB_ID);
        assertThat(out.name()).isEqualTo("Panteras");
        assertThat(out.photoPrincipalUrl()).isEqualTo("url:p");
    }

    // ---------- createSubgroup ----------
    @Test
    @DisplayName("createSubgroup: crea cuando el nombre no existe")
    void create_ok() {
        when(subgroupRepository.existsBySectionIdAndName(SECTION_ID, "Panteras")).thenReturn(false);
        when(subgroupRepository.save(any(Subgroup.class))).thenAnswer(inv -> {
            Subgroup s = inv.getArgument(0);
            s.setSubgroupId(SUB_ID);
            return s;
        });

        SubgroupDTO dto = new SubgroupDTO(null, null, null, SECTION_ID, "Panteras",
                "desc", null, true, null, null);

    SubgroupResponseDTO out = service.createSubgroup(TENANT_ID, GROUP_SLUG, SECTION_ID, dto);

        assertThat(out.subgroupId()).isEqualTo(SUB_ID);
        assertThat(out.name()).isEqualTo("Panteras");
        verify(subgroupRepository).existsBySectionIdAndName(SECTION_ID, "Panteras");
        verify(subgroupRepository).save(any(Subgroup.class));
    }

    @Test
    @DisplayName("createSubgroup: lanza excepción si el nombre ya existe en la sección")
    void create_conflict() {
        when(subgroupRepository.existsBySectionIdAndName(SECTION_ID, "Panteras")).thenReturn(true);

        SubgroupDTO dto = new SubgroupDTO(null, null, null, SECTION_ID, "Panteras",
                "desc", null, true, null, null);

    assertThatThrownBy(() -> service.createSubgroup(TENANT_ID, GROUP_SLUG, SECTION_ID, dto))
            .isInstanceOf(RuntimeException.class);

        verify(subgroupRepository, never()).save(any());
    }

    // ---------- updateSubgroup ----------
    @Test
    @DisplayName("updateSubgroup: actualiza nombre/desc y reemplaza foto (borra anterior)")
    void update_ok() {
        UUID oldPic = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        UUID newPic = UUID.fromString("123e4567-e89b-12d3-a456-426614174111");
        Subgroup existing = makeEntity("Viejo", oldPic);

        when(subgroupRepository.findById(SUB_ID)).thenReturn(Optional.of(existing));
        when(subgroupRepository.save(any(Subgroup.class))).thenAnswer(inv -> inv.getArgument(0));
        when(subgroupRepository.existsBySectionIdAndName(SECTION_ID, "Nuevo")).thenReturn(false);

        SubgroupDTO patch = new SubgroupDTO(SUB_ID, null, null, SECTION_ID, "Nuevo",
                "desc nueva", newPic, true, null, null);

    SubgroupResponseDTO out = service.updateSubgroup(TENANT_ID, GROUP_SLUG, SECTION_ID, SUB_ID, patch);

        assertThat(out.name()).isEqualTo("Nuevo");
        verify(storageService).deleteFileByObjectId(oldPic);
        verify(subgroupRepository).save(any(Subgroup.class));
    }

    // ---------- deleteSubgroup ----------
    @Test
    @DisplayName("deleteSubgroup: elimina y borra foto principal si existe")
    void delete_ok() {
        UUID pic = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        when(subgroupRepository.findById(SUB_ID)).thenReturn(Optional.of(makeEntity("Panteras", pic)));

    service.deleteSubgroup(TENANT_ID, GROUP_SLUG, SECTION_ID, SUB_ID);

        verify(storageService).deleteFileByObjectId(pic);
        verify(subgroupRepository).delete(any(Subgroup.class));
    }

    // ---------- updatePhotoPrincipal ----------
    @Test
    @DisplayName("updatePhotoPrincipal: reemplaza foto y elimina la anterior si cambia")
    void update_photo_ok() {
        UUID oldPic = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        UUID newPic = UUID.fromString("123e4567-e89b-12d3-a456-426614174111");
        when(subgroupRepository.findById(SUB_ID)).thenReturn(Optional.of(makeEntity("Panteras", oldPic)));

    service.updatePhotoPrincipal(TENANT_ID, GROUP_SLUG, SECTION_ID, SUB_ID, newPic);

        verify(storageService).deleteFileByObjectId(oldPic);
        verify(subgroupRepository).save(argThat(s -> newPic.equals(s.getPhotoPrincipal())));
    }

    @Test
    @DisplayName("updatePhotoPrincipal: no borra si es el mismo UUID")
    void update_photo_same_uuid() {
        UUID same = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        when(subgroupRepository.findById(SUB_ID)).thenReturn(Optional.of(makeEntity("Panteras", same)));

    service.updatePhotoPrincipal(TENANT_ID, GROUP_SLUG, SECTION_ID, SUB_ID, same);

        verify(storageService, never()).deleteFileByObjectId(any());
        verify(subgroupRepository).save(argThat(s -> same.equals(s.getPhotoPrincipal())));
    }

    // ---------- deletePhotoPrincipal ----------
    @Test
    @DisplayName("deletePhotoPrincipal: borra la foto y persiste null")
    void delete_photo_ok() {
        UUID pic = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        when(subgroupRepository.findById(SUB_ID)).thenReturn(Optional.of(makeEntity("Panteras", pic)));

    service.deletePhotoPrincipal(TENANT_ID, GROUP_SLUG, SECTION_ID, SUB_ID);

        verify(storageService).deleteFileByObjectId(pic);
        verify(subgroupRepository).save(argThat(s -> s.getPhotoPrincipal() == null));
    }

    @Test
    @DisplayName("getSubgroupsBySection: devuelve sin URLs cuando Supabase limita conexiones")
    void list_rateLimit_fallback() {
        UUID pic = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        when(subgroupRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, GROUP_ID, SECTION_ID))
            .thenReturn(List.of(makeEntity("Panteras", pic)));
        when(storageService.getPublicUrlsFromObjectIds(anySet()))
            .thenThrow(new RuntimeException("maxclientsinsessionmode: max clients reached"));

    List<SubgroupResponseDTO> out = service.getSubgroupsBySection(TENANT_ID, GROUP_SLUG, SECTION_ID);

        assertThat(out).hasSize(1);
        assertThat(out.get(0).photoPrincipalUrl()).isNull();
    }

    @Test
    @DisplayName("deleteSubgroup: continúa aun cuando Supabase retorna 403 en eliminación")
    void delete_permission_error() {
        UUID pic = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        when(subgroupRepository.findById(SUB_ID)).thenReturn(Optional.of(makeEntity("Panteras", pic)));
        doThrow(new RuntimeException("403 access denied"))
            .when(storageService).deleteFileByObjectId(pic);

    assertThatCode(() -> service.deleteSubgroup(TENANT_ID, GROUP_SLUG, SECTION_ID, SUB_ID))
            .doesNotThrowAnyException();

        verify(subgroupRepository).delete(any(Subgroup.class));
        verify(storageService).deleteFileByObjectId(pic);
    }

    @ParameterizedTest(name = "Clasificación SubgroupService: {0}")
    @MethodSource("supabaseErrorMessages")
    void classify_supabase_errors(String message, String bucket, UUID objectId, Long fileSize) throws Exception {
        Method method = SubgroupService.class.getDeclaredMethod(
                "classifyAndLogSupabaseError",
                Exception.class,
                String.class,
                String.class,
                UUID.class,
                Long.class
        );
        method.setAccessible(true);

    assertThatCode(() -> method.invoke(
        service,
        new RuntimeException(message),
        "diagnostic",
        bucket,
        objectId,
        fileSize
    )).doesNotThrowAnyException();
    }

    private static Stream<Arguments> supabaseErrorMessages() {
        UUID sampleId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
        return Stream.of(
                Arguments.of("invalid jwt token", null, null, null),
                Arguments.of("403 access denied", null, null, null),
                Arguments.of("404 no such bucket", "gallery-bucket", sampleId, null),
                Arguments.of("409 resourcealreadyexists", null, null, null),
                Arguments.of("413 entity too large", null, null, 1_048_576L),
                Arguments.of("maxclientsinsessionmode: max clients reached", null, null, null),
                Arguments.of("failed to fetch due to cors", null, null, null),
                Arguments.of("500 internal server error", null, null, null),
                Arguments.of("unexpected supabase outage", null, null, null)
        );
    }
}
