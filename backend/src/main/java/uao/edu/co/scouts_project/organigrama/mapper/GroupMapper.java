package uao.edu.co.scouts_project.organigrama.mapper;

import org.springframework.stereotype.Component;
import uao.edu.co.scouts_project.organigrama.dto.CreatingGroupDTO;
import uao.edu.co.scouts_project.organigrama.interfaces.IMapper;
import uao.edu.co.scouts_project.organigrama.model.Group;

/**
 * Mapper concreto para convertir CreatingGroupDTO -> Group.
 * Cumple con SOLID: implementa la interfaz genérica IMapper.
 */
@Component
public class GroupMapper implements IMapper<CreatingGroupDTO, Group> {

    @Override
    public Group toEntity(CreatingGroupDTO dto) {
        if (dto == null) return null;

        Group group = new Group();
        group.setTenantId(dto.getTenantId());
        group.setSlug(dto.getSlug());
        group.setName(dto.getName());
        group.setDistrict(dto.getDistrict());
        group.setIdentifierNumber(dto.getIdentifierNumber());
        group.setAddress(dto.getAddress());
        group.setPhone(dto.getPhone());
        group.setEmail(dto.getEmail());
        group.setFoundedIn(dto.getFoundedIn());
        group.setMotto(dto.getMotto());
        group.setMission(dto.getMission());
        group.setVision(dto.getVision());
        group.setHistory(dto.getHistory());
        group.setLogoObjectId(dto.getLogoObjectId());
        group.setScarfObjectId(dto.getScarfObjectId());
        group.setSocialLinks(dto.getSocialLinks());
        group.setConfig(dto.getConfig());
        group.setIsActive(dto.getIsActive());
        group.setStatus(dto.getStatus());

        return group;
    }
}
