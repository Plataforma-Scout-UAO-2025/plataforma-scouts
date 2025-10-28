package uao.edu.co.scouts_project.organigrama.interfaces;

import java.util.List;
import java.util.UUID;

import uao.edu.co.scouts_project.organigrama.dto.CreatingGroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;

public interface IGroupService {
    List<GroupResponseDTO> getGroupsByTenant(String tenantId);

    boolean validateSlug(String slug);

    GroupResponseDTO getGroupBySlug(String tenantId, String groupSlug);

    GroupResponseDTO createGroup(String tenantId, GroupDTO dto);

    GroupResponseDTO createGroup(CreatingGroupDTO dto);

    GroupResponseDTO updateGroup(String tenantId, String groupSlug, GroupDTO dto);

    void deleteGroup(String tenantId, String groupSlug);

    void deleteLogoImage(String tenantId, String groupSlug);

    void deleteScarfImage(String tenantId, String groupSlug);

    void updateLogo(String tenantId, String groupSlug, UUID logoObjectId);

    void updateScarf(String tenantId, String groupSlug, UUID scarfObjectId);
}
