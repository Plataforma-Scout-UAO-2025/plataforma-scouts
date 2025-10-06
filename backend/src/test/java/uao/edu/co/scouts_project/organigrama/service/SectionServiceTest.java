package uao.edu.co.scouts_project.organigrama.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.dto.SectionResponseDTO;
import uao.edu.co.scouts_project.organigrama.model.Group;
import uao.edu.co.scouts_project.organigrama.model.Section;
import uao.edu.co.scouts_project.organigrama.model.Tenant;
import uao.edu.co.scouts_project.organigrama.repository.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.*;

/**
 * Unit tests (puro Mockito + JUnit 5) — sin contexto de Spring.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SectionService (unit)")
class SectionServiceTest {

    @Mock SectionRepository sectionRepository;
    @Mock GroupRepository groupRepository;
    @Mock TenantRepository tenantRepository;
    @Mock SupabaseStorageService storageService;
    @Mock SubgroupService subgroupService;

    @InjectMocks SectionService sectionService;

    // ----- INICIO DE LA CORRECCIÓN -----

    // ELIMINADOS: Los métodos tenantMock y groupMock se han eliminado
    // porque contenían llamadas a when() que causaban el error UnfinishedStubbing.
    // La lógica se ha movido directamente a stubTenantGroupResolution.

    // CORREGIDO: Este método ahora crea y configura los mocks en el orden correcto.
    private void stubTenantGroupResolution(String tenantSlug, String tenantId, String groupSlug, Long groupId) {
        // 1. Crear las instancias de los mocks
        Tenant mockTenant = mock(Tenant.class);
        Group mockGroup = mock(Group.class);

        // 2. Configurar el comportamiento de esas instancias
        when(mockTenant.getTenantId()).thenReturn(tenantId);
        when(mockGroup.getGroupId()).thenReturn(groupId);
        // La siguiente línea no es estrictamente necesaria para que la prueba pase,
        // pero es una buena práctica para que el mock sea consistente.
        when(mockGroup.getTenantId()).thenReturn(tenantId);

        // 3. Usar los mocks ya configurados en el .thenReturn() de los repositorios
        when(tenantRepository.findBySlug(tenantSlug)).thenReturn(Optional.of(mockTenant));
        when(groupRepository.findByTenantIdAndSlug(tenantId, groupSlug)).thenReturn(Optional.of(mockGroup));
    }
    
    // ----- FIN DE LA CORRECCIÓN -----

    private Section newSection(Long id, String tenantId, Long groupId, String name) {
        Section s = new Section();
        // setters del JPA entity
        try {
            // Usamos reflexión para establecer el ID, ya que es generado por la BD y no tiene setter público.
            java.lang.reflect.Field field = Section.class.getDeclaredField("sectionId");
            field.setAccessible(true);
            field.set(s, id);
        } catch (Exception ignored) {}
        s.setTenantId(tenantId);
        s.setGroupId(groupId);
        s.setName(name);
        s.setDescription("desc");
        s.setIconObjectId(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));
        s.setPhotoPrincipal(UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));
        s.setGalleryObjectIds(new UUID[]{
            UUID.fromString("11111111-1111-1111-1111-111111111111"),
            UUID.fromString("22222222-2222-2222-2222-222222222222")
        });
        s.setCreatedAt(Instant.parse("2025-01-01T00:00:00Z"));
        s.setUpdatedAt(Instant.parse("2025-02-01T00:00:00Z"));
        return s;
    }

    @Test
    @DisplayName("getSectionById: mapea entidad a ResponseDTO con URLs (storage)")
    void getSectionById_ok() {
        stubTenantGroupResolution("region-valle", "t-123", "grupo-803", 803L);

        Section sec = newSection(10L, "t-123", 803L, "Tropa");
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("t-123", 803L, 10L))
            .thenReturn(Optional.of(sec));

        Map<UUID, String> urlMap = new HashMap<>();
        urlMap.put(sec.getIconObjectId(), "https://cdn/icon.png");
        urlMap.put(sec.getPhotoPrincipal(), "https://cdn/photo.png");
        urlMap.put(sec.getGalleryObjectIds()[0], "https://cdn/g1.png");
        urlMap.put(sec.getGalleryObjectIds()[1], "https://cdn/g2.png");
        when(storageService.getPublicUrlsFromObjectIds(anySet())).thenReturn(urlMap);

        SectionResponseDTO dto = sectionService.getSectionById("region-valle", "grupo-803", 10L);

        assertThat(dto.sectionId()).isEqualTo(10L);
        assertThat(dto.name()).isEqualTo("Tropa");
        assertThat(dto.iconObjectUrl()).isEqualTo("https://cdn/icon.png");
        assertThat(dto.photoPrincipalUrl()).isEqualTo("https://cdn/photo.png");
        assertThat(dto.galleryObjectUrls()).containsExactlyInAnyOrder("https://cdn/g1.png", "https://cdn/g2.png");

        verify(sectionRepository).findByTenantIdAndGroupIdAndSectionId("t-123", 803L, 10L);
        verify(storageService).getPublicUrlsFromObjectIds(anySet());
    }

    @Test
    @DisplayName("getSectionById: lanza IllegalArgumentException si no existe")
    void getSectionById_notFound() {
        stubTenantGroupResolution("region-valle", "t-123", "grupo-803", 803L);
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("t-123", 803L, 99L))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> sectionService.getSectionById("region-valle", "grupo-803", 99L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Section not found");

        verify(sectionRepository).findByTenantIdAndGroupIdAndSectionId("t-123", 803L, 99L);
    }

    @Test
    @DisplayName("createSection: error si nombre duplicado en el grupo")
    void createSection_duplicate() {
        stubTenantGroupResolution("region-valle", "t-123", "grupo-803", 803L);
        when(sectionRepository.existsByGroupIdAndName(803L, "Tropa")).thenReturn(true);

        SectionDTO incoming = new SectionDTO(null, null, null, "Tropa", "desc", null, null, null, null, null);

        assertThatThrownBy(() -> sectionService.createSection("region-valle", "grupo-803", incoming))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("already exists");

        verify(sectionRepository).existsByGroupIdAndName(803L, "Tropa");
        verifyNoMoreInteractions(sectionRepository);
    }

    @Test
    @DisplayName("createSection: crea y devuelve ResponseDTO")
    void createSection_ok() {
        stubTenantGroupResolution("region-valle", "t-123", "grupo-803", 803L);
        when(sectionRepository.existsByGroupIdAndName(803L, "Tropa")).thenReturn(false);

        Section saved = newSection(10L, "t-123", 803L, "Tropa");
        when(sectionRepository.save(any(Section.class))).thenReturn(saved);
        when(storageService.getPublicUrlsFromObjectIds(anySet())).thenReturn(Collections.emptyMap());

        SectionDTO incoming = new SectionDTO(null, null, null, "Tropa", "desc", null, null, null, null, null);

        SectionResponseDTO out = sectionService.createSection("region-valle", "grupo-803", incoming);

        assertThat(out.sectionId()).isEqualTo(10L);
        assertThat(out.name()).isEqualTo("Tropa");
        verify(sectionRepository).existsByGroupIdAndName(803L, "Tropa");
        verify(sectionRepository).save(any(Section.class));
    }

    @Test
    @DisplayName("updateSection: actualiza campos y retorna DTO")
    void updateSection_ok() {
        stubTenantGroupResolution("region-valle", "t-123", "grupo-803", 803L);
        Section existing = newSection(10L, "t-123", 803L, "Tropa");
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("t-123", 803L, 10L))
            .thenReturn(Optional.of(existing));

        when(sectionRepository.save(any(Section.class)))
            .thenAnswer(inv -> inv.getArgument(0));

        SectionDTO patch = new SectionDTO(null, null, null, "Tropa Nueva", "descripcion", null, null, null, null, null);

        SectionResponseDTO out = sectionService.updateSection("region-valle", "grupo-803", 10L, patch);

        assertThat(out.name()).isEqualTo("Tropa Nueva");
        assertThat(out.description()).isEqualTo("descripcion");
        verify(sectionRepository).save(any(Section.class));
    }

    @Test
    @DisplayName("deleteSection: elimina si existe")
    void deleteSection_ok() {
        stubTenantGroupResolution("region-valle", "t-123", "grupo-803", 803L);
        Section sec = newSection(10L, "t-123", 803L, "Tropa");
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("t-123", 803L, 10L))
            .thenReturn(Optional.of(sec));

        sectionService.deleteSection("region-valle", "grupo-803", 10L);

        verify(sectionRepository).delete(sec);
    }

    @Test
    @DisplayName("updateIcon: guarda nuevo UUID y persiste")
    void updateIcon_ok() {
        stubTenantGroupResolution("region-valle", "t-123", "grupo-803", 803L);
        Section sec = newSection(10L, "t-123", 803L, "Tropa");
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("t-123", 803L, 10L))
            .thenReturn(Optional.of(sec));
        when(sectionRepository.save(any(Section.class))).thenReturn(sec);

        UUID icon = UUID.randomUUID();
        sectionService.updateIcon("region-valle", "grupo-803", 10L, icon);

        ArgumentCaptor<Section> captor = ArgumentCaptor.forClass(Section.class);
        verify(sectionRepository).save(captor.capture());
        assertThat(captor.getValue().getIconObjectId()).isEqualTo(icon);
    }

    @Test
    @DisplayName("deleteGalleryImageById: remueve un UUID existente")
    void deleteGalleryImageById_ok() {
        stubTenantGroupResolution("region-valle", "t-123", "grupo-803", 803L);
        Section sec = newSection(10L, "t-123", 803L, "Tropa");
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("t-123", 803L, 10L))
            .thenReturn(Optional.of(sec));

        UUID toRemove = sec.getGalleryObjectIds()[0];
        sectionService.deleteGalleryImageById("region-valle", "grupo-803", 10L, toRemove);

        ArgumentCaptor<Section> captor = ArgumentCaptor.forClass(Section.class);
        verify(sectionRepository).save(captor.capture());
        assertThat(Arrays.asList(captor.getValue().getGalleryObjectIds())).doesNotContain(toRemove);
    }

    @Nested
    @DisplayName("Errores de resolución tenant/grupo")
    class ResolutionErrors {
        @Test
        @DisplayName("Tenant no existe -> IllegalArgumentException")
        void tenantNotFound() {
            when(tenantRepository.findBySlug("region-valle")).thenReturn(Optional.empty());
            assertThatThrownBy(() -> sectionService.getSectionById("region-valle", "grupo-803", 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found");
        }

        @Test
        @DisplayName("Group no existe -> IllegalArgumentException")
        void groupNotFound() {
            // CORREGIDO: Se crea y configura el mock de Tenant directamente aquí.
            Tenant mockTenant = mock(Tenant.class);
            when(mockTenant.getTenantId()).thenReturn("t-1");
            when(tenantRepository.findBySlug("region-valle")).thenReturn(Optional.of(mockTenant));

            when(groupRepository.findByTenantIdAndSlug("t-1", "grupo-803")).thenReturn(Optional.empty());
            
            assertThatThrownBy(() -> sectionService.getSectionById("region-valle", "grupo-803", 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Group");
        }
    }
}