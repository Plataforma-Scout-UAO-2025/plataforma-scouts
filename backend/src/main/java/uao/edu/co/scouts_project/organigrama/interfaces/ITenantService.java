package uao.edu.co.scouts_project.organigrama.interfaces;

import java.util.List;
import uao.edu.co.scouts_project.organigrama.dto.TenantDTO;
import uao.edu.co.scouts_project.organigrama.dto.TenantInfoDTO;

public interface ITenantService {
    List<TenantDTO> getAllTenants();

    TenantDTO getTenantById(String tenantId);

    TenantDTO createTenant(TenantDTO dto);

    TenantDTO updateTenant(String tenantId, TenantDTO dto);

    TenantDTO createTenantInfo(TenantInfoDTO dto);

    TenantDTO updateTenantInfo(String tenantId, TenantInfoDTO dto);

    String getTenantIdBySlug(String slug);

    void deleteTenant(String tenantId);
}
