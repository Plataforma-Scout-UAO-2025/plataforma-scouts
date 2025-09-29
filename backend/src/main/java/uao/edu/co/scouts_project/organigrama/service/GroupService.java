package uao.edu.co.scouts_project.organigrama.service;

import uao.edu.co.scouts_project.organigrama.domain.Group;
import uao.edu.co.scouts_project.organigrama.domain.Tenant;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.repo.GroupRepository;
import uao.edu.co.scouts_project.organigrama.repo.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupService {
    
    private final GroupRepository groupRepository;
    private final TenantRepository tenantRepository;
    
    public GroupService(GroupRepository groupRepository, TenantRepository tenantRepository) {
        this.groupRepository = groupRepository;
        this.tenantRepository = tenantRepository;
    }
    
    @Transactional(readOnly = true)
    public List<GroupDTO> getGroupsByTenant(String tenantSlug) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        return groupRepository.findByTenantId(tenant.getTenantId())
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public GroupDTO getGroupBySlug(String tenantSlug, String groupSlug) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug)
            .orElseThrow(() -> new IllegalArgumentException("Group not found with slug: " + groupSlug));
        return toDTO(group);
    }
    
    @Transactional
    public GroupDTO createGroup(String tenantSlug, GroupDTO dto) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        
        if (groupRepository.existsByTenantIdAndSlug(tenant.getTenantId(), dto.slug())) {
            throw new IllegalArgumentException("Group with slug '" + dto.slug() + "' already exists in this tenant");
        }
        
        if (dto.identifierNumber() != null && 
            groupRepository.existsByTenantIdAndIdentifierNumber(tenant.getTenantId(), dto.identifierNumber())) {
            throw new IllegalArgumentException("Group with identifier number '" + dto.identifierNumber() + "' already exists in this tenant");
        }
        
        Group group = new Group(tenant.getTenantId(), dto.slug(), dto.name());
        mapDtoToEntity(dto, group);
        
        Group saved = groupRepository.save(group);
        return toDTO(saved);
    }
    
    @Transactional
    public GroupDTO updateGroup(String tenantSlug, String groupSlug, GroupDTO dto) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug)
            .orElseThrow(() -> new IllegalArgumentException("Group not found with slug: " + groupSlug));
        
        mapDtoToEntity(dto, group);
        Group updated = groupRepository.save(group);
        return toDTO(updated);
    }
    
    @Transactional
    public void deleteGroup(String tenantSlug, String groupSlug) {
        Tenant tenant = getTenantBySlug(tenantSlug);
        Group group = groupRepository.findByTenantIdAndSlug(tenant.getTenantId(), groupSlug)
            .orElseThrow(() -> new IllegalArgumentException("Group not found with slug: " + groupSlug));
        groupRepository.delete(group);
    }
    
    private Tenant getTenantBySlug(String tenantSlug) {
        return tenantRepository.findBySlug(tenantSlug)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found with slug: " + tenantSlug));
    }
    
    private void mapDtoToEntity(GroupDTO dto, Group group) {
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
    
    private GroupDTO toDTO(Group group) {
        return new GroupDTO(
            group.getGroupId(),
            group.getTenantId(),
            group.getSlug(),
            group.getName(),
            group.getDistrict(),
            group.getIdentifierNumber(),
            group.getAddress(),
            group.getPhone(),
            group.getEmail(),
            group.getFoundedIn(),
            group.getMotto(),
            group.getMission(),
            group.getVision(),
            group.getHistory(),
            group.getLogoObjectId(),
            group.getScarfObjectId(),
            group.getSocialLinks(),
            group.getConfig(),
            group.getIsActive(),
            group.getStatus(),
            group.getCreatedAt(),
            group.getUpdatedAt()
        );
    }
}