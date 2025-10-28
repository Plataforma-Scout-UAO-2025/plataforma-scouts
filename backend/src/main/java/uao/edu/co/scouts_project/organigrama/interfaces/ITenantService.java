package uao.edu.co.scouts_project.organigrama.interfaces;

import java.util.List;
import uao.edu.co.scouts_project.organigrama.dto.TenantDTO;

public interface ITenantService {
    List<TenantDTO> getAllTenants();

    TenantDTO getTenantById(String tenantId);

    TenantDTO createTenant(TenantDTO dto);

    TenantDTO updateTenant(String tenantId, TenantDTO dto);

    void deleteTenant(String tenantId);
}
