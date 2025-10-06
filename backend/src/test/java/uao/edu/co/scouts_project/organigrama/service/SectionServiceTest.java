package uao.edu.co.scouts_project.organigrama.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uao.edu.co.scouts_project.organigrama.dto.GalleryPatchRequest;
import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.dto.SectionResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupResponseDTO;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SectionServiceTest {

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private SupabaseStorageService storageService;

    @Mock
    private SubgroupService subgroupService;

    @InjectMocks
    private SectionService sectionService;

    private Tenant tenant;
    private Group group;
    private Section section;
    private UUID iconId;
    private UUID photoId;
    private UUID[] galleryIds;

    @BeforeEach
    void setUp() {
        // Configurar datos de prueba
        tenant = new Tenant();
        tenant.setTenantId("tenant1");
        tenant.setSlug("tenant-slug");

        group = new Group();
        group.setGroupId(1L);
        group.setTenantId("tenant1");
        group.setSlug("group-slug");
        group.setName("Test Group");

        iconId = UUID.randomUUID();
        photoId = UUID.randomUUID();
        galleryIds = new UUID[]{UUID.randomUUID(), UUID.randomUUID()};

        section = new Section("tenant1", 1L, "Manada");
        section.setSectionId(1L);
        section.setDescription("Test Description");
        section.setIconObjectId(iconId);
        section.setPhotoPrincipal(photoId);
        section.setGalleryObjectIds(galleryIds);
        section.setCreatedAt(Instant.now());
        section.setUpdatedAt(Instant.now());
    }

    @Test
    @DisplayName("Debe obtener secciones por grupo")
    void testGetSectionsByGroup() {
        // Arrange
        Section section2 = new Section("tenant1", 1L, "Tropa");
        section2.setSectionId(2L);
        List<Section> sections = Arrays.asList(section, section2);

        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupId("tenant1", 1L)).thenReturn(sections);
        
        Map<UUID, String> urlMap = new HashMap<>();
        urlMap.put(iconId, "http://icon-url");
        urlMap.put(photoId, "http://photo-url");
        for (UUID galleryId : galleryIds) {
            urlMap.put(galleryId, "http://gallery-" + galleryId);
        }
        when(storageService.getPublicUrlsFromObjectIds(any(Set.class))).thenReturn(urlMap);

        // Act
        List<SectionResponseDTO> result = sectionService.getSectionsByGroup("tenant-slug", "group-slug");

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).name()).isEqualTo("Manada");
        assertThat(result.get(0).iconObjectUrl()).isEqualTo("http://icon-url");
        assertThat(result.get(0).photoPrincipalUrl()).isEqualTo("http://photo-url");
        assertThat(result.get(0).gallery()).hasSize(2);
        verify(sectionRepository).findByTenantIdAndGroupId("tenant1", 1L);
    }

    @Test
    @DisplayName("Debe obtener sección por ID")
    void testGetSectionById() {
        // Arrange
        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 1L))
                .thenReturn(Optional.of(section));
        
        Map<UUID, String> urlMap = new HashMap<>();
        urlMap.put(iconId, "http://icon-url");
        urlMap.put(photoId, "http://photo-url");
        when(storageService.getPublicUrlsFromObjectIds(any(Set.class))).thenReturn(urlMap);

        // Act
        SectionResponseDTO result = sectionService.getSectionById("tenant-slug", "group-slug", 1L);

        // Assert
        assertThat(result.sectionId()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Manada");
        assertThat(result.description()).isEqualTo("Test Description");
        assertThat(result.iconObjectUrl()).isEqualTo("http://icon-url");
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando no encuentra sección por ID")
    void testGetSectionById_NotFound() {
        // Arrange
        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> sectionService.getSectionById("tenant-slug", "group-slug", 999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Section not found with id: 999");
    }

    @Test
    @DisplayName("Debe obtener sección con subgrupos")
    void testGetSectionWithSubgroups() {
        // Arrange
        List<SubgroupResponseDTO> subgroups = Arrays.asList(
            new SubgroupResponseDTO(1L, "tenant1", 1L, 1L, "Subgrupo 1", "Desc 1", null, null, null, null),
            new SubgroupResponseDTO(2L, "tenant1", 1L, 1L, "Subgrupo 2", "Desc 2", null, null, null, null)
        );

        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 1L))
                .thenReturn(Optional.of(section));
        when(subgroupService.getSubgroupsBySection("tenant-slug", "group-slug", 1L))
                .thenReturn(subgroups);
        when(storageService.getPublicUrlsFromObjectIds(any(Set.class))).thenReturn(Collections.emptyMap());

        // Act
        Map<String, Object> result = sectionService.getSectionWithSubgroups("tenant-slug", "group-slug", 1L);

        // Assert
        assertThat(result).containsKeys("section", "subgroups");
        assertThat(result.get("section")).isInstanceOf(SectionResponseDTO.class);
        assertThat((List<?>) result.get("subgroups")).hasSize(2);
        verify(subgroupService).getSubgroupsBySection("tenant-slug", "group-slug", 1L);
    }

    @Test
    @DisplayName("Debe crear nueva sección")
    void testCreateSection() {
        // Arrange
        SectionDTO dto = new SectionDTO(null, "tenant1", 1L, "Nueva Sección", 
                "Nueva descripción", iconId, photoId, galleryIds, null, null);

        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.existsByGroupIdAndName(1L, "Nueva Sección")).thenReturn(false);
        when(sectionRepository.save(any(Section.class))).thenAnswer(invocation -> {
            Section saved = invocation.getArgument(0);
            saved.setSectionId(10L);
            saved.setCreatedAt(Instant.now());
            saved.setUpdatedAt(Instant.now());
            return saved;
        });
        when(storageService.getPublicUrlsFromObjectIds(any(Set.class))).thenReturn(Collections.emptyMap());

        // Act
        SectionResponseDTO result = sectionService.createSection("tenant-slug", "group-slug", dto);

        // Assert
        assertThat(result.sectionId()).isEqualTo(10L);
        assertThat(result.name()).isEqualTo("Nueva Sección");
        assertThat(result.description()).isEqualTo("Nueva descripción");
        
        ArgumentCaptor<Section> sectionCaptor = ArgumentCaptor.forClass(Section.class);
        verify(sectionRepository).save(sectionCaptor.capture());
        Section savedSection = sectionCaptor.getValue();
        assertThat(savedSection.getName()).isEqualTo("Nueva Sección");
        assertThat(savedSection.getTenantId()).isEqualTo("tenant1");
        assertThat(savedSection.getGroupId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el nombre de sección ya existe")
    void testCreateSection_DuplicateName() {
        // Arrange
        SectionDTO dto = new SectionDTO(null, "tenant1", 1L, "Manada", 
                "Descripción", null, null, null, null, null);

        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.existsByGroupIdAndName(1L, "Manada")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> sectionService.createSection("tenant-slug", "group-slug", dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Section with name 'Manada' already exists");
    }

    @Test
    @DisplayName("Debe actualizar sección existente")
    void testUpdateSection() {
        // Arrange
        UUID newIconId = UUID.randomUUID();
        UUID newPhotoId = UUID.randomUUID();
        SectionDTO dto = new SectionDTO(1L, "tenant1", 1L, "Manada Actualizada", 
                "Descripción actualizada", newIconId, newPhotoId, null, null, null);

        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 1L))
                .thenReturn(Optional.of(section));
        when(sectionRepository.save(any(Section.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storageService.getPublicUrlsFromObjectIds(any(Set.class))).thenReturn(Collections.emptyMap());

        // Act
        SectionResponseDTO result = sectionService.updateSection("tenant-slug", "group-slug", 1L, dto);

        // Assert
        assertThat(result.name()).isEqualTo("Manada Actualizada");
        assertThat(result.description()).isEqualTo("Descripción actualizada");
        
        // Verificar que se eliminaron las imágenes anteriores
        verify(storageService).deleteFileByObjectId(iconId);
        verify(storageService).deleteFileByObjectId(photoId);
        verify(sectionRepository).save(any(Section.class));
    }

    @Test
    @DisplayName("Debe eliminar sección y sus archivos asociados")
    void testDeleteSection() {
        // Arrange
        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act
        sectionService.deleteSection("tenant-slug", "group-slug", 1L);

        // Assert
        verify(storageService).deleteFileByObjectId(iconId);
        verify(storageService).deleteFileByObjectId(photoId);
        for (UUID galleryId : galleryIds) {
            verify(storageService).deleteFileByObjectId(galleryId);
        }
        verify(sectionRepository).delete(section);
    }

    @Test
    @DisplayName("Debe eliminar imagen del ícono")
    void testDeleteIconImage() {
        // Arrange
        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act
        sectionService.deleteIconImage("tenant-slug", "group-slug", 1L);

        // Assert
        verify(storageService).deleteFileByObjectId(iconId);
        assertThat(section.getIconObjectId()).isNull();
        verify(sectionRepository).save(section);
    }

    @Test
    @DisplayName("Debe actualizar ícono y eliminar el anterior")
    void testUpdateIcon() {
        // Arrange
        UUID newIconId = UUID.randomUUID();
        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act
        sectionService.updateIcon("tenant-slug", "group-slug", 1L, newIconId);

        // Assert
        verify(storageService).deleteFileByObjectId(iconId);
        assertThat(section.getIconObjectId()).isEqualTo(newIconId);
        verify(sectionRepository).save(section);
    }

    @Test
    @DisplayName("Debe actualizar foto principal y eliminar la anterior")
    void testUpdatePhotoPrincipal() {
        // Arrange
        UUID newPhotoId = UUID.randomUUID();
        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act
        sectionService.updatePhotoPrincipal("tenant-slug", "group-slug", 1L, newPhotoId);

        // Assert
        verify(storageService).deleteFileByObjectId(photoId);
        assertThat(section.getPhotoPrincipal()).isEqualTo(newPhotoId);
        verify(sectionRepository).save(section);
    }

    @Test
    @DisplayName("Debe eliminar imagen de la galería por ID")
    void testDeleteGalleryImageById() {
        // Arrange
        UUID imageToDelete = galleryIds[0];
        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 1L))
                .thenReturn(Optional.of(section));
        when(sectionRepository.save(any(Section.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storageService.getPublicUrlsFromObjectIds(any(Set.class))).thenReturn(Collections.emptyMap());

        // Act
        SectionResponseDTO result = sectionService.deleteGalleryImageById(
                "tenant-slug", "group-slug", 1L, imageToDelete, true);

        // Assert
        verify(storageService).deleteFileByObjectId(imageToDelete);
        assertThat(section.getGalleryObjectIds()).hasSize(1);
        assertThat(section.getGalleryObjectIds()).doesNotContain(imageToDelete);
        verify(sectionRepository).save(section);
    }

    @Test
    @DisplayName("Debe aplicar operaciones de patch en galería")
    void testPatchGalleryAndReturn() {
        // Arrange
        UUID newImage = UUID.randomUUID();
        UUID replaceTarget = galleryIds[0];
        UUID replaceWith = UUID.randomUUID();
        
        List<GalleryPatchRequest.PatchOperation> operations = Arrays.asList(
                new GalleryPatchRequest.PatchOperation("add", null, newImage),
                new GalleryPatchRequest.PatchOperation("replace", replaceTarget, replaceWith)
        );

        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 1L))
                .thenReturn(Optional.of(section));
        when(sectionRepository.save(any(Section.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storageService.getPublicUrlsFromObjectIds(any(Set.class))).thenReturn(Collections.emptyMap());

        // Act
        SectionResponseDTO result = sectionService.patchGalleryAndReturn(
                "tenant-slug", "group-slug", 1L, operations);

        // Assert
        verify(storageService).deleteFileByObjectId(replaceTarget); // Se eliminó la imagen reemplazada
        assertThat(section.getGalleryObjectIds()).hasSize(3); // 2 originales - 1 reemplazada + 1 nueva = 3
        assertThat(section.getGalleryObjectIds()).contains(newImage, replaceWith, galleryIds[1]);
        assertThat(section.getGalleryObjectIds()).doesNotContain(replaceTarget);
        verify(sectionRepository).save(section);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando tenant no existe")
    void testGetSectionById_TenantNotFound() {
        // Arrange
        when(tenantRepository.findBySlug("invalid-tenant")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> sectionService.getSectionById("invalid-tenant", "group-slug", 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found with slug: invalid-tenant");
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando grupo no existe")
    void testGetSectionById_GroupNotFound() {
        // Arrange
        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "invalid-group")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> sectionService.getSectionById("tenant-slug", "invalid-group", 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Group not found with slug: invalid-group");
    }

    @Test
    @DisplayName("Debe manejar errores del servicio de almacenamiento gracefully")
    void testGetSectionById_StorageServiceError() {
        // Arrange
        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 1L))
                .thenReturn(Optional.of(section));
        when(storageService.getPublicUrlsFromObjectIds(any(Set.class)))
                .thenThrow(new RuntimeException("Storage service error"));

        // Act
        SectionResponseDTO result = sectionService.getSectionById("tenant-slug", "group-slug", 1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.sectionId()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Manada");
        assertThat(result.iconObjectUrl()).isNull(); // URLs no disponibles debido al error
        assertThat(result.photoPrincipalUrl()).isNull();
    }

    @Test
    @DisplayName("Debe validar operaciones de patch incorrectas")
    void testPatchGalleryAndReturn_InvalidOperations() {
        // Arrange
        List<GalleryPatchRequest.PatchOperation> invalidOps = Arrays.asList(
                new GalleryPatchRequest.PatchOperation("invalid", null, null)
        );

        when(tenantRepository.findBySlug("tenant-slug")).thenReturn(Optional.of(tenant));
        when(groupRepository.findByTenantIdAndSlug("tenant1", "group-slug")).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId("tenant1", 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act & Assert
        assertThatThrownBy(() -> sectionService.patchGalleryAndReturn(
                "tenant-slug", "group-slug", 1L, invalidOps))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Operación no soportada: invalid");
    }
}