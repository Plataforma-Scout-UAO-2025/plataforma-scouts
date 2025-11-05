
package uao.edu.co.scouts_project.organigrama.interfaces;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import uao.edu.co.scouts_project.organigrama.dto.CreateGroupAdminRequestDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupAdminCreatedResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupDTO;
import uao.edu.co.scouts_project.organigrama.dto.GroupResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.SlugValidationResponseDTO;
import uao.edu.co.scouts_project.organigrama.dto.UpdatingGroupDTO;

public interface IGroupService {

    GroupResponseDTO createGroup(GroupDTO dto);

    GroupResponseDTO createGroupFull(GroupDTO dto, MultipartFile imageFile);

    GroupResponseDTO getGroupBySlug(String tenantId, String groupSlug);

    GroupResponseDTO[] getAllGroups();

    List<GroupResponseDTO> getGroupsByTenant(String tenantId);

    GroupResponseDTO updateGroupActiveStatus(String tenantId, String groupSlug, Boolean isActive);

    GroupResponseDTO updateGroup(String tenantId, String groupSlug, GroupDTO dto);

    GroupResponseDTO updateGroup(String tenantId, String groupSlug, UpdatingGroupDTO dto);

    void updateLogo(String tenantId, String groupSlug, UUID logoObjectId);

    void updateScarf(String tenantId, String groupSlug, UUID scarfObjectId);

    String deleteGroup(Long groupId);

    void deleteLogoImage(String tenantId, String groupSlug);

    void deleteScarfImage(String tenantId, String groupSlug);

    void ensureSlugIsUnique(String slug);

    void validateSlugFormat(String slug);

    SlugValidationResponseDTO validateSlug(String slug);

    GroupAdminCreatedResponseDTO addGroupAdmin(String slug, String tenantId, CreateGroupAdminRequestDTO request);

    /**
     * Crea un administrador de grupo usando la conexión correcta de Auth0 basada en el slug del grupo.
     * Este método asegura que el usuario se cree en la conexión específica del grupo.
     */
    GroupAdminCreatedResponseDTO addGroupAdminWithConnection(String slug, String tenantId, CreateGroupAdminRequestDTO request);

}
