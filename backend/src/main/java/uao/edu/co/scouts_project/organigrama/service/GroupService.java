package uao.edu.co.scouts_project.organigrama.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uao.edu.co.scouts_project.organigrama.domain.Group;
import uao.edu.co.scouts_project.organigrama.domain.Tenant;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.repo.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repo.TenantRepository;
import uao.edu.co.scouts_project.storage.service.SupabaseStorageService;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupService {
    
    private final GroupRepository groupRepository;
    private final TenantRepository tenantRepository;
    private final SupabaseStorageService storageService;

    public GroupService(GroupRepository groupRepository, 
                        TenantRepository tenantRepository, 
                        SupabaseStorageService storageService) {
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
        this.storageService = storageService;
    }
    
    // MÉTODOS EXISTENTES (sin cambios)...
    @Transactional(readOnly = true)
    public List<GroupResponseDTO> getGroupsByTenant(String tenantSlug) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        return groupRepository.findByTenantId(tenant.getTenantId())
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public GroupResponseDTO getGroupBySlug(String tenantSlug, String groupSlug) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        Group group = findGroupOrThrow(tenant.getTenantId(), groupSlug);
        return toResponseDTO(group);
    }
    
    @Transactional
    public GroupResponseDTO createGroup(String tenantSlug, GroupDTO dto) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        
        if (groupRepository.existsByTenantIdAndSlug(tenant.getTenantId(), dto.slug())) {
            throw new IllegalArgumentException("Group with slug '" + dto.slug() + "' already exists in this tenant");
        }
        
        Group group = new Group(tenant.getTenantId(), dto.slug(), dto.name());
        mapDtoToEntity(dto, group);
        
        Group saved = groupRepository.save(group);
        return toResponseDTO(saved);
    }
    
    @Transactional
    public GroupResponseDTO updateGroup(String tenantSlug, String groupSlug, GroupDTO dto) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        Group group = findGroupOrThrow(tenant.getTenantId(), groupSlug);
        
        if (dto.logoObjectId() != null && !Objects.equals(dto.logoObjectId(), group.getLogoObjectId())) {
            storageService.deleteFileByObjectId(group.getLogoObjectId());
        }
        if (dto.scarfObjectId() != null && !Objects.equals(dto.scarfObjectId(), group.getScarfObjectId())) {
            storageService.deleteFileByObjectId(group.getScarfObjectId());
        }
        
        mapDtoToEntity(dto, group);
        Group updated = groupRepository.save(group);
        return toResponseDTO(updated);
    }
    
    @Transactional
    public void deleteGroup(String tenantSlug, String groupSlug) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        Group group = findGroupOrThrow(tenant.getTenantId(), groupSlug);
        
        storageService.deleteFileByObjectId(group.getLogoObjectId());
        storageService.deleteFileByObjectId(group.getScarfObjectId());
        
        groupRepository.delete(group);
    }
    
    // ============== NUEVOS MÉTODOS PARA ELIMINACIÓN INDIVIDUAL ==============
    
    @Transactional
    public void deleteLogoImage(String tenantSlug, String groupSlug) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        Group group = findGroupOrThrow(tenant.getTenantId(), groupSlug);
        
        UUID logoIdToDelete = group.getLogoObjectId();
        if (logoIdToDelete != null) {
            storageService.deleteFileByObjectId(logoIdToDelete);
            group.setLogoObjectId(null);
            groupRepository.save(group);
        }
    }

    @Transactional
    public void deleteScarfImage(String tenantSlug, String groupSlug) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        Group group = findGroupOrThrow(tenant.getTenantId(), groupSlug);
        
        UUID scarfIdToDelete = group.getScarfObjectId();
        if (scarfIdToDelete != null) {
            storageService.deleteFileByObjectId(scarfIdToDelete);
            group.setScarfObjectId(null);
            groupRepository.save(group);
        }
    }
    
    // ============== MÉTODOS PRIVADOS AUXILIARES ==============
    
    private Group findGroupOrThrow(Long tenantId, String groupSlug) {
        return groupRepository.findByTenantIdAndSlug(tenantId, groupSlug)
            .orElseThrow(() -> new IllegalArgumentException("Group not found with slug: " + groupSlug));
    }
    
    private Tenant getTenantBySlug(String tenantSlug) {
        return tenantRepository.findBySlug(tenantSlug)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found with slug: " + tenantSlug));
    }
    
    private void mapDtoToEntity(GroupDTO dto, Group group) {
        //... (código de mapeo sin cambios)
        if (dto.name() != null) group.setName(dto.name());
        if (dto.district() != null) group.setDistrict(dto.district());
        if (dto.identifierNumber() != null) group.setIdentifierNumber(dto.identifierNumber());
        if (dto.address() != null) group.setAddress(dto.address());
        if (dto.phone() != null) group.setPhone(dto.phone());
        if (dto.email() != null) group.setEmail(dto.email());
        if (dto.foundedIn() != null) group.setFoundedIn(dto.foundedIn());
        if (dto.motto() != null) group.setMotto(dto.motto());
        if (dto.mission() != null) group.setMission(dto.mission());
        if (dto.vision() != null) group.setVision(dto.vision());
        if (dto.history() != null) group.setHistory(dto.history());
        if (dto.logoObjectId() != null) group.setLogoObjectId(dto.logoObjectId());
        if (dto.scarfObjectId() != null) group.setScarfObjectId(dto.scarfObjectId());
        if (dto.socialLinks() != null) group.setSocialLinks(dto.socialLinks());
        if (dto.config() != null) group.setConfig(dto.config());
        if (dto.isActive() != null) group.setIsActive(dto.isActive());
        if (dto.status() != null) group.setStatus(dto.status());
    }
    
    private GroupResponseDTO toResponseDTO(Group group) {
        String logoUrl = storageService.getPublicUrlFromObjectId(group.getLogoObjectId());
        String scarfUrl = storageService.getPublicUrlFromObjectId(group.getScarfObjectId());

        return new GroupResponseDTO(
            group.getGroupId(), group.getTenantId(), group.getSlug(), group.getName(),
            group.getDistrict(), group.getIdentifierNumber(), group.getAddress(), group.getPhone(),
            group.getEmail(), group.getFoundedIn(), group.getMotto(), group.getMission(),
            group.getVision(), group.getHistory(), logoUrl, scarfUrl, group.getSocialLinks(),
            group.getConfig(), group.getIsActive(), group.getStatus(),
            group.getCreatedAt(), group.getUpdatedAt()
        );
    }
}