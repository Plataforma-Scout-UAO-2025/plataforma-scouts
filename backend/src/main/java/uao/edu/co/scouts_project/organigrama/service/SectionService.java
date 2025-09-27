package uao.edu.co.scouts_project.organigrama.service;

import uao.edu.co.scouts_project.organigrama.domain.Group;
import uao.edu.co.scouts_project.organigrama.domain.Section;
import uao.edu.co.scouts_project.organigrama.domain.Tenant;
import uao.edu.co.scouts_project.organigrama.dto.SectionDTO;
import uao.edu.co.scouts_project.organigrama.repo.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repo.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repo.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SectionService {
    
    private final SectionRepository sectionRepository;
    private final GroupRepository groupRepository;
    private final TenantRepository tenantRepository;
    
    public SectionService(SectionRepository sectionRepository, GroupRepository groupRepository, TenantRepository tenantRepository) {
        this.sectionRepository = sectionRepository;
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
    }
    
    @Transactional(readOnly = true)
    public List<SectionDTO> getSectionsByGroup(String tenantSlug, String groupSlug) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
        return sectionRepository.findByTenantIdAndGroupId(group.getTenantId(), group.getGroupId())
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public SectionDTO getSectionById(String tenantSlug, String groupSlug, Long sectionId) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
        Section section = sectionRepository.findByTenantIdAndGroupIdAndSectionId(group.getTenantId(), group.getGroupId(), sectionId)
            .orElseThrow(() -> new IllegalArgumentException("Section not found with id: " + sectionId));
        return toDTO(section);
    }
    
    @Transactional
    public SectionDTO createSection(String tenantSlug, String groupSlug, SectionDTO dto) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
        
        if (sectionRepository.existsByGroupIdAndSectionName(group.getGroupId(), dto.sectionName())) {
            throw new IllegalArgumentException("Section with name '" + dto.sectionName() + "' already exists in this group");
        }
        
        Section section = new Section(group.getTenantId(), group.getGroupId(), dto.sectionName());
        mapDtoToEntity(dto, section);
        
        Section saved = sectionRepository.save(section);
        return toDTO(saved);
    }
    
    @Transactional
    public SectionDTO updateSection(String tenantSlug, String groupSlug, Long sectionId, SectionDTO dto) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
        Section section = sectionRepository.findByTenantIdAndGroupIdAndSectionId(group.getTenantId(), group.getGroupId(), sectionId)
            .orElseThrow(() -> new IllegalArgumentException("Section not found with id: " + sectionId));
        
        mapDtoToEntity(dto, section);
        Section updated = sectionRepository.save(section);
        return toDTO(updated);
    }
    
    @Transactional
    public void deleteSection(String tenantSlug, String groupSlug, Long sectionId) {
        Group group = getGroupBySlug(tenantSlug, groupSlug);
        Section section = sectionRepository.findByTenantIdAndGroupIdAndSectionId(group.getTenantId(), group.getGroupId(), sectionId)
            .orElseThrow(() -> new IllegalArgumentException("Section not found with id: " + sectionId));
        sectionRepository.delete(section);
    }
    
    private Group getGroupBySlug(String tenantSlug, String groupSlug) {
        Tenant tenant = tenantRepository.findBySlug(tenantSlug)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found with slug: " + tenantSlug));
        return groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug)
            .orElseThrow(() -> new IllegalArgumentException("Group not found with slug: " + groupSlug));
    }
    
    private void mapDtoToEntity(SectionDTO dto, Section section) {
        if (dto.sectionName() != null) section.setSectionName(dto.sectionName());
        if (dto.sectionDescription() != null) section.setSectionDescription(dto.sectionDescription());
        if (dto.sectionIconObjectId() != null) section.setSectionIconObjectId(dto.sectionIconObjectId());
        if (dto.sectionGalleryObjectIds() != null) section.setSectionGalleryObjectIds(dto.sectionGalleryObjectIds());
    }
    
    private SectionDTO toDTO(Section section) {
        return new SectionDTO(
            section.getSectionId(),
            section.getTenantId(),
            section.getGroupId(),
            section.getSectionName(),
            section.getSectionDescription(),
            section.getSectionIconObjectId(),
            section.getSectionGalleryObjectIds(),
            section.getCreatedAt(),
            section.getUpdatedAt()
        );
    }
}
