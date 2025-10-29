
package uao.edu.co.scouts_project.organigrama.interfaces;

import java.util.List;
import java.util.UUID;

import uao.edu.co.scouts_project.organigrama.dto.CreatingGroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.UpdatingGroupDTO;

public interface IGroupService {

    GroupResponseDTO updateGroupActiveStatus(String tenantId, String groupSlug, Boolean isActive);

    GroupResponseDTO createGroup(CreatingGroupDTO dto);

    GroupResponseDTO createGroup(String tenantId, GroupDTO dto);

    GroupResponseDTO getGroupBySlug(String tenantId, String groupSlug);

    GroupResponseDTO updateGroup(String tenantId, String groupSlug, UpdatingGroupDTO dto);

    GroupResponseDTO[] getAllGroups();

    List<GroupResponseDTO> getGroupsByTenant(String tenantId);

    String deleteGroup(Long groupId);

    void deleteGroup(String tenantId, String groupSlug);

    void deleteLogoImage(String tenantId, String groupSlug);

    void deleteScarfImage(String tenantId, String groupSlug);

    void ensureSlugIsUnique(String slug);

    void updateLogo(String tenantId, String groupSlug, UUID logoObjectId);

    void updateScarf(String tenantId, String groupSlug, UUID scarfObjectId);

    void validateSlugFormat(String slug);
}
