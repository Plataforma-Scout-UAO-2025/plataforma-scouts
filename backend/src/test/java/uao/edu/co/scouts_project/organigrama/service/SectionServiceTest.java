package uao.edu.co.scouts_project.organigrama.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.Arguments;
import uao.edu.co.scouts_project.organigrama.dto.GalleryPatchRequest;
import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.dto.SectionResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.model.Group;
import uao.edu.co.scouts_project.organigrama.model.Section;
import uao.edu.co.scouts_project.organigrama.repository.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repository.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;

import java.lang.reflect.Method;
import java.time.Instant;
import java.util.*;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SectionServiceTest {

        private static final String TENANT_ID = "tenant1";
        private static final String GROUP_SLUG = "group-slug";

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

    private Group group;
    private Section section;
    private UUID iconId;
    private UUID photoId;
    private UUID[] galleryIds;

    @BeforeEach
    void setUp() {
        // Configurar datos de prueba
        lenient().when(tenantRepository.existsById(TENANT_ID)).thenReturn(true);

        group = new Group();
        group.setGroupId(1L);
        group.setTenantId(TENANT_ID);
        group.setSlug(GROUP_SLUG);
        group.setName("Test Group");

        iconId = UUID.randomUUID();
        photoId = UUID.randomUUID();
        galleryIds = new UUID[]{UUID.randomUUID(), UUID.randomUUID()};

        section = new Section(TENANT_ID, 1L, "Manada");
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
        Section section2 = new Section(TENANT_ID, 1L, "Tropa");
        section2.setSectionId(2L);
        List<Section> sections = Arrays.asList(section, section2);

        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupId(TENANT_ID, 1L)).thenReturn(sections);
        
        Map<UUID, String> urlMap = new HashMap<>();
        urlMap.put(iconId, "http://icon-url");
        urlMap.put(photoId, "http://photo-url");
        for (UUID galleryId : galleryIds) {
            urlMap.put(galleryId, "http://gallery-" + galleryId);
        }
        when(storageService.getPublicUrlsFromObjectIds(ArgumentMatchers.<Set<UUID>>any())).thenReturn(urlMap);

        // Act
        List<SectionResponseDTO> result = sectionService.getSectionsByGroup(TENANT_ID, GROUP_SLUG);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).name()).isEqualTo("Manada");
        assertThat(result.get(0).iconObjectUrl()).isEqualTo("http://icon-url");
        assertThat(result.get(0).photoPrincipalUrl()).isEqualTo("http://photo-url");
        assertThat(result.get(0).gallery()).hasSize(2);
        verify(sectionRepository).findByTenantIdAndGroupId(TENANT_ID, 1L);
    }

    @Test
    @DisplayName("Debe obtener sección por ID")
    void testGetSectionById() {
        // Arrange
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));
        
        Map<UUID, String> urlMap = new HashMap<>();
        urlMap.put(iconId, "http://icon-url");
        urlMap.put(photoId, "http://photo-url");
        when(storageService.getPublicUrlsFromObjectIds(ArgumentMatchers.<Set<UUID>>any())).thenReturn(urlMap);

        // Act
        SectionResponseDTO result = sectionService.getSectionById(TENANT_ID, GROUP_SLUG, 1L);

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
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> sectionService.getSectionById(TENANT_ID, GROUP_SLUG, 999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Section not found with id: 999");
    }

    @Test
    @DisplayName("Debe obtener sección con subgrupos")
    void testGetSectionWithSubgroups() {
        // Arrange
        List<SubgroupResponseDTO> subgroups = Arrays.asList(
            new SubgroupResponseDTO(1L, TENANT_ID, 1L, 1L, "Subgrupo 1", "Desc 1", null, null, true, Instant.now(), Instant.now()),
            new SubgroupResponseDTO(2L, TENANT_ID, 1L, 1L, "Subgrupo 2", "Desc 2", null, null, true, Instant.now(), Instant.now())
        );

        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));
        when(subgroupService.getSubgroupsBySection(TENANT_ID, GROUP_SLUG, 1L))
                .thenReturn(subgroups);
        when(storageService.getPublicUrlsFromObjectIds(ArgumentMatchers.<Set<UUID>>any())).thenReturn(Collections.emptyMap());

        // Act
        Map<String, Object> result = sectionService.getSectionWithSubgroups(TENANT_ID, GROUP_SLUG, 1L);

        // Assert
        assertThat(result).containsKeys("section", "subgroups");
        assertThat(result.get("section")).isInstanceOf(SectionResponseDTO.class);
        assertThat((List<?>) result.get("subgroups")).hasSize(2);
        verify(subgroupService).getSubgroupsBySection(TENANT_ID, GROUP_SLUG, 1L);
    }

    @Test
    @DisplayName("Debe crear nueva sección")
    void testCreateSection() {
        // Arrange
        SectionDTO dto = new SectionDTO(null, TENANT_ID, 1L, "Nueva Sección", 
                "Nueva descripción", iconId, photoId, galleryIds, null, null);

        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.existsByGroupIdAndName(1L, "Nueva Sección")).thenReturn(false);
        when(sectionRepository.save(any(Section.class))).thenAnswer(invocation -> {
            Section saved = invocation.getArgument(0);
            saved.setSectionId(10L);
            saved.setCreatedAt(Instant.now());
            saved.setUpdatedAt(Instant.now());
            return saved;
        });
        when(storageService.getPublicUrlsFromObjectIds(ArgumentMatchers.<Set<UUID>>any())).thenReturn(Collections.emptyMap());

        // Act
        SectionResponseDTO result = sectionService.createSection(TENANT_ID, GROUP_SLUG, dto);

        // Assert
        assertThat(result.sectionId()).isEqualTo(10L);
        assertThat(result.name()).isEqualTo("Nueva Sección");
        assertThat(result.description()).isEqualTo("Nueva descripción");
        
        ArgumentCaptor<Section> sectionCaptor = ArgumentCaptor.forClass(Section.class);
        verify(sectionRepository).save(sectionCaptor.capture());
        Section savedSection = sectionCaptor.getValue();
        assertThat(savedSection.getName()).isEqualTo("Nueva Sección");
        assertThat(savedSection.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(savedSection.getGroupId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando el nombre de sección ya existe")
    void testCreateSection_DuplicateName() {
        // Arrange
        SectionDTO dto = new SectionDTO(null, TENANT_ID, 1L, "Manada", 
                "Descripción", null, null, null, null, null);

        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.existsByGroupIdAndName(1L, "Manada")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> sectionService.createSection(TENANT_ID, GROUP_SLUG, dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Section with name 'Manada' already exists");
    }

    @Test
    @DisplayName("Debe actualizar sección existente")
    void testUpdateSection() {
        // Arrange
        UUID newIconId = UUID.randomUUID();
        UUID newPhotoId = UUID.randomUUID();
        SectionDTO dto = new SectionDTO(1L, TENANT_ID, 1L, "Manada Actualizada", 
                "Descripción actualizada", newIconId, newPhotoId, null, null, null);

        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));
        when(sectionRepository.save(any(Section.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storageService.getPublicUrlsFromObjectIds(ArgumentMatchers.<Set<UUID>>any())).thenReturn(Collections.emptyMap());

        // Act
        SectionResponseDTO result = sectionService.updateSection(TENANT_ID, GROUP_SLUG, 1L, dto);

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
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act
        sectionService.deleteSection(TENANT_ID, GROUP_SLUG, 1L);

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
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act
        sectionService.deleteIconImage(TENANT_ID, GROUP_SLUG, 1L);

        // Assert
        verify(storageService).deleteFileByObjectId(iconId);
        assertThat(section.getIconObjectId()).isNull();
        verify(sectionRepository).save(section);
    }

        @Test
        @DisplayName("Debe ignorar eliminación del ícono cuando no existe")
        void testDeleteIconImage_noIcon() {
                // Arrange
                section.setIconObjectId(null);
                when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
                when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                                .thenReturn(Optional.of(section));

                // Act
                sectionService.deleteIconImage(TENANT_ID, GROUP_SLUG, 1L);

                // Assert
                verify(storageService, never()).deleteFileByObjectId(any());
                verify(sectionRepository, never()).save(any());
        }

    @Test
    @DisplayName("Debe actualizar ícono y eliminar el anterior")
    void testUpdateIcon() {
        // Arrange
        UUID newIconId = UUID.randomUUID();
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act
        sectionService.updateIcon(TENANT_ID, GROUP_SLUG, 1L, newIconId);

        // Assert
        verify(storageService).deleteFileByObjectId(iconId);
        assertThat(section.getIconObjectId()).isEqualTo(newIconId);
        verify(sectionRepository).save(section);
    }

        @Test
        @DisplayName("Debe conservar ícono cuando se envía el mismo UUID")
        void testUpdateIcon_sameUuid() {
                // Arrange
                when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
                when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                                .thenReturn(Optional.of(section));

                // Act
                sectionService.updateIcon(TENANT_ID, GROUP_SLUG, 1L, iconId);

                // Assert
                verify(storageService, never()).deleteFileByObjectId(any());
                verify(sectionRepository).save(argThat(saved -> iconId.equals(saved.getIconObjectId())));
        }

    @Test
    @DisplayName("Debe actualizar foto principal y eliminar la anterior")
    void testUpdatePhotoPrincipal() {
        // Arrange
        UUID newPhotoId = UUID.randomUUID();
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act
        sectionService.updatePhotoPrincipal(TENANT_ID, GROUP_SLUG, 1L, newPhotoId);

        // Assert
        verify(storageService).deleteFileByObjectId(photoId);
        assertThat(section.getPhotoPrincipal()).isEqualTo(newPhotoId);
        verify(sectionRepository).save(section);
    }

    @Test
    @DisplayName("Debe conservar foto principal cuando se envía el mismo UUID")
    void testUpdatePhotoPrincipal_sameUuid() {
        // Arrange
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act
        sectionService.updatePhotoPrincipal(TENANT_ID, GROUP_SLUG, 1L, photoId);

        // Assert
        verify(storageService, never()).deleteFileByObjectId(any());
        verify(sectionRepository).save(argThat(saved -> photoId.equals(saved.getPhotoPrincipal())));
    }

    @Test
    @DisplayName("Debe eliminar foto principal y persistir null")
    void testDeletePhotoPrincipal_whenPresent() {
        // Arrange
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));
        when(sectionRepository.save(any(Section.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        sectionService.deletePhotoPrincipal(TENANT_ID, GROUP_SLUG, 1L);

        // Assert
        verify(storageService).deleteFileByObjectId(photoId);
        assertThat(section.getPhotoPrincipal()).isNull();
        verify(sectionRepository).save(section);
    }

    @Test
    @DisplayName("Debe ignorar eliminación de foto principal cuando no existe")
    void testDeletePhotoPrincipal_whenEmpty() {
        // Arrange
        section.setPhotoPrincipal(null);
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act
        sectionService.deletePhotoPrincipal(TENANT_ID, GROUP_SLUG, 1L);

        // Assert
        verify(storageService, never()).deleteFileByObjectId(any());
        verify(sectionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe eliminar imagen de la galería por ID")
    void testDeleteGalleryImageById() {
        // Arrange
        UUID imageToDelete = galleryIds[0];
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));
        when(sectionRepository.save(any(Section.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storageService.getPublicUrlsFromObjectIds(ArgumentMatchers.<Set<UUID>>any())).thenReturn(Collections.emptyMap());

        // Act
        SectionResponseDTO result = sectionService.deleteGalleryImageById(
                TENANT_ID, GROUP_SLUG, 1L, imageToDelete, true);

        // Assert
        assertThat(result).isNotNull();
        verify(storageService).deleteFileByObjectId(imageToDelete);
        assertThat(section.getGalleryObjectIds()).hasSize(1);
        assertThat(section.getGalleryObjectIds()).doesNotContain(imageToDelete);
        verify(sectionRepository).save(section);
    }

    @Test
    @DisplayName("Debe actualizar galería sin borrar del storage cuando se indica")
    void testDeleteGalleryImageById_skipStorageDeletion() {
        // Arrange
        UUID imageToDelete = galleryIds[0];
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));
        when(sectionRepository.save(any(Section.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storageService.getPublicUrlsFromObjectIds(ArgumentMatchers.<Set<UUID>>any())).thenReturn(Collections.emptyMap());

        // Act
        SectionResponseDTO result = sectionService.deleteGalleryImageById(
                TENANT_ID, GROUP_SLUG, 1L, imageToDelete, false);

        // Assert
        assertThat(result).isNotNull();
        verify(storageService, never()).deleteFileByObjectId(imageToDelete);
        assertThat(section.getGalleryObjectIds()).hasSize(1).doesNotContain(imageToDelete);
        verify(sectionRepository).save(section);
    }

    @Test
    @DisplayName("Debe lanzar excepción si la galería está vacía al eliminar imagen")
    void testDeleteGalleryImageById_emptyGallery() {
        // Arrange
        section.setGalleryObjectIds(new UUID[0]);
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act & Assert
        assertThatThrownBy(() -> sectionService.deleteGalleryImageById(
                TENANT_ID, GROUP_SLUG, 1L, UUID.randomUUID(), true))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Gallery is empty");

        verify(storageService, never()).deleteFileByObjectId(any());
        verify(sectionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar excepción si el UUID no está en la galería")
    void testDeleteGalleryImageById_notFound() {
        // Arrange
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));

        UUID unknown = UUID.randomUUID();

        // Act & Assert
        assertThatThrownBy(() -> sectionService.deleteGalleryImageById(
                TENANT_ID, GROUP_SLUG, 1L, unknown, true))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Imagen no encontrada");

        verify(storageService, never()).deleteFileByObjectId(any());
        verify(sectionRepository, never()).save(any());
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

        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));
        when(sectionRepository.save(any(Section.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(storageService.getPublicUrlsFromObjectIds(ArgumentMatchers.<Set<UUID>>any())).thenReturn(Collections.emptyMap());

        // Act
        SectionResponseDTO result = sectionService.patchGalleryAndReturn(
                TENANT_ID, GROUP_SLUG, 1L, operations);

        // Assert
        assertThat(result).isNotNull();
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
        when(tenantRepository.existsById("invalid-tenant")).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> sectionService.getSectionById("invalid-tenant", GROUP_SLUG, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found with id: invalid-tenant");
    }

    @Test
    @DisplayName("Debe lanzar excepción cuando grupo no existe")
    void testGetSectionById_GroupNotFound() {
        // Arrange
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, "invalid-group")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> sectionService.getSectionById(TENANT_ID, "invalid-group", 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Group not found with slug: invalid-group");
    }

    @Test
    @DisplayName("Debe manejar errores del servicio de almacenamiento gracefully")
    void testGetSectionById_StorageServiceError() {
        // Arrange
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));
        when(storageService.getPublicUrlsFromObjectIds(ArgumentMatchers.<Set<UUID>>any()))
                .thenThrow(new RuntimeException("Storage service error"));

        // Act
        SectionResponseDTO result = sectionService.getSectionById(TENANT_ID, GROUP_SLUG, 1L);

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

        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));

        // Act & Assert
        assertThatThrownBy(() -> sectionService.patchGalleryAndReturn(
                TENANT_ID, GROUP_SLUG, 1L, invalidOps))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Operación no soportada: invalid");
    }

    @Test
    @DisplayName("Debe continuar cuando Supabase alcanza MaxClientsInSessionMode")
    void testGetSectionsByGroup_RateLimitFallback() {
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupId(TENANT_ID, 1L))
                .thenReturn(Collections.singletonList(section));
        when(storageService.getPublicUrlsFromObjectIds(ArgumentMatchers.<Set<UUID>>any()))
                .thenThrow(new RuntimeException("maxclientsinsessionmode: max clients reached"));

        List<SectionResponseDTO> result = sectionService.getSectionsByGroup(TENANT_ID, GROUP_SLUG);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).iconObjectUrl()).isNull();
        assertThat(result.get(0).photoPrincipalUrl()).isNull();
    }

    @Test
    @DisplayName("Debe capturar errores de permisos al eliminar archivos en Supabase")
    void testDeleteSection_PermissionError() {
        when(groupRepository.findByTenantIdAndSlug(TENANT_ID, GROUP_SLUG)).thenReturn(Optional.of(group));
        when(sectionRepository.findByTenantIdAndGroupIdAndSectionId(TENANT_ID, 1L, 1L))
                .thenReturn(Optional.of(section));

        doThrow(new RuntimeException("403 access denied"))
                .when(storageService).deleteFileByObjectId(any(UUID.class));

        assertThatCode(() -> sectionService.deleteSection(TENANT_ID, GROUP_SLUG, 1L))
                .doesNotThrowAnyException();

        verify(sectionRepository).delete(section);
        verify(storageService, atLeastOnce()).deleteFileByObjectId(any(UUID.class));
    }

    @ParameterizedTest(name = "Clasifica mensaje Supabase: {0}")
    @MethodSource("supabaseErrorMessages")
    void shouldClassifySupabaseErrorsWithoutThrowing(String message, String bucket, UUID objectId, Long fileSize) throws Exception {
        Method method = SectionService.class.getDeclaredMethod(
                "classifyAndLogSupabaseError",
                Exception.class,
                String.class,
                String.class,
                UUID.class,
                Long.class
        );
        method.setAccessible(true);

        assertThatCode(() -> method.invoke(
                sectionService,
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