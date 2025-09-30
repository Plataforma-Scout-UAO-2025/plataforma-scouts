package uao.edu.co.scouts_project.organigrama.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uao.edu.co.scouts_project.organigrama.domain.Group;
import uao.edu.co.scouts_project.organigrama.domain.Section;
import uao.edu.co.scouts_project.organigrama.domain.Tenant;
import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.dto.SectionResponseDTO;
import uao.edu.co.scouts_project.organigrama.repo.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repo.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repo.TenantRepository;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SectionService {
    
    private final SectionRepository sectionRepository;
    private final GroupRepository groupRepository;
    private final TenantRepository tenantRepository;
    private final SupabaseStorageService storageService;

    public SectionService(SectionRepository sectionRepository, GroupRepository groupRepository, 
                          TenantRepository tenantRepository, SupabaseStorageService storageService) {
        this.sectionRepository = sectionRepository;
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
        this.storageService = storageService;
    }
    
    @Transactional(readOnly = true)
    public List<SectionResponseDTO> getSectionsByGroup(String tenantSlug, String groupSlug) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
        return sectionRepository.findByTenantIdAndGroupId(group.getTenantId(), group.getGroupId())
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public SectionResponseDTO getSectionById(String tenantSlug, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);
        return toResponseDTO(section);
    }
    
    @Transactional
    public SectionResponseDTO createSection(String tenantSlug, String groupSlug, SectionDTO dto) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
        if (sectionRepository.existsByGroupIdAndName(group.getGroupId(), dto.name())) {
            throw new IllegalArgumentException("Section with name '" + dto.name() + "' already exists in this group");
        }
        Section section = new Section(group.getTenantId(), group.getGroupId(), dto.name());
        mapDtoToEntity(dto, section);
        Section saved = sectionRepository.save(section);
        return toResponseDTO(saved);
    }
    
    @Transactional
    public SectionResponseDTO updateSection(String tenantSlug, String groupSlug, Long sectionId, SectionDTO dto) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);
        
        if (dto.iconObjectId() != null && !Objects.equals(dto.iconObjectId(), section.getIconObjectId())) {
            storageService.deleteFileByObjectId(section.getIconObjectId());
        }
        // Al actualizar, se reemplaza la galería completa. Primero se borran las antiguas.
        if (dto.galleryObjectIds() != null) {
            if (section.getGalleryObjectIds() != null) {
                Arrays.stream(section.getGalleryObjectIds()).forEach(storageService::deleteFileByObjectId);
            }
        }

        mapDtoToEntity(dto, section);
        Section updated = sectionRepository.save(section);
        return toResponseDTO(updated);
    }
    
    @Transactional
    public void deleteSection(String tenantSlug, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);
        
        storageService.deleteFileByObjectId(section.getIconObjectId());
        if (section.getGalleryObjectIds() != null) {
            Arrays.stream(section.getGalleryObjectIds()).forEach(storageService::deleteFileByObjectId);
        }
        
        sectionRepository.delete(section);
    }

    // ============== MÉTODOS PARA ELIMINACIÓN INDIVIDUAL DE IMÁGENES ==============
    
    @Transactional
    public void deleteIconImage(String tenantSlug, String groupSlug, Long sectionId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);
        
        UUID iconIdToDelete = section.getIconObjectId();
        if (iconIdToDelete != null) {
            storageService.deleteFileByObjectId(iconIdToDelete);
            section.setIconObjectId(null);
            sectionRepository.save(section);
        }
    }
    
    /**
     * Elimina UNA imagen específica de la galería de una sección por su UUID.
     * @param objectId UUID de la imagen a eliminar
     */
    @Transactional
    public void deleteGalleryImageById(String tenantSlug, String groupSlug, Long sectionId, UUID objectId) {
        Section section = findSectionOrThrow(tenantSlug, groupSlug, sectionId);
        
        UUID[] galleryIds = section.getGalleryObjectIds();
        if (galleryIds == null || galleryIds.length == 0) {
            return; // No hay nada que hacer
        }

        // Convertir el array a una lista mutable para poder eliminar elementos
        List<UUID> galleryIdList = new ArrayList<>(Arrays.asList(galleryIds));
        
        // Si la imagen a eliminar está en la lista y se elimina con éxito
        if (galleryIdList.remove(objectId)) {
            // Eliminar el archivo físico de Supabase
            storageService.deleteFileByObjectId(objectId);
            
            // Actualizar la entidad con el nuevo array (ya sin el elemento eliminado)
            section.setGalleryObjectIds(galleryIdList.toArray(new UUID[0]));
            sectionRepository.save(section);
        }
    }

    // ============== MÉTODOS PRIVADOS AUXILIARES ==============

    private Section findSectionOrThrow(String tenantSlug, String groupSlug, Long sectionId) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
        return sectionRepository.findByTenantIdAndGroupIdAndSectionId(group.getTenantId(), group.getGroupId(), sectionId)
            .orElseThrow(() -> new IllegalArgumentException("Section not found with id: " + sectionId));
    }
    
    private Group getGroupBySlug(String tenantSlug, String groupSlug) {
        Tenant tenant = tenantRepository.findBySlug(tenantSlug)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found with slug: " + tenantSlug));
        return groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug)
            .orElseThrow(() -> new IllegalArgumentException("Group not found with slug: " + groupSlug));
    }
    
    private void mapDtoToEntity(SectionDTO dto, Section section) {
        if (dto.name() != null) section.setName(dto.name());
        if (dto.description() != null) section.setDescription(dto.description());
        if (dto.iconObjectId() != null) section.setIconObjectId(dto.iconObjectId());
        if (dto.galleryObjectIds() != null) section.setGalleryObjectIds(dto.galleryObjectIds());
    }
    
    private SectionResponseDTO toResponseDTO(Section section) {
        String iconUrl = storageService.getPublicUrlFromObjectId(section.getIconObjectId());
        
        List<String> galleryUrls;
        if (section.getGalleryObjectIds() != null && section.getGalleryObjectIds().length > 0) {
            galleryUrls = Arrays.stream(section.getGalleryObjectIds())
                                .map(storageService::getPublicUrlFromObjectId)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());
        } else {
            galleryUrls = Collections.emptyList();
        }

        return new SectionResponseDTO(
            section.getSectionId(),
            section.getTenantId(),
            section.getGroupId(),
            section.getName(),
            section.getDescription(),
            iconUrl,
            galleryUrls,
            section.getCreatedAt(),
            section.getUpdatedAt()
        );
    }
}