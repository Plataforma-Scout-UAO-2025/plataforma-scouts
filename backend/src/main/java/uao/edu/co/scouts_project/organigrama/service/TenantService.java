package uao.edu.co.scouts_project.organigrama.service;

import uao.edu.co.scouts_project.organigrama.dto.TenantDTO;
import uao.edu.co.scouts_project.organigrama.model.Tenant;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TenantService {
    
    private final TenantRepository tenantRepository;
    
    public TenantService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }
    
    @Transactional(readOnly = true)
    public List<TenantDTO> getAllTenants() {
        return tenantRepository.findAll()
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public TenantDTO getTenantById(String tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found with id: " + tenantId));
        return toDTO(tenant);
    }
    
    @Transactional
    public TenantDTO createTenant(TenantDTO dto) {
        if (tenantRepository.existsBySlug(dto.slug())) {
            throw new IllegalArgumentException("Tenant with slug '" + dto.slug() + "' already exists");
        }
        
        Tenant tenant = new Tenant(dto.slug());
        if (dto.status() != null) {
            tenant.setStatus(dto.status());
        }
        
        Tenant saved = tenantRepository.save(tenant);
        return toDTO(saved);
    }
    
    @Transactional
    public TenantDTO updateTenant(String tenantId, TenantDTO dto) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found with id: " + tenantId));
        
        if (dto.status() != null) {
            tenant.setStatus(dto.status());
        }
        
        Tenant updated = tenantRepository.save(tenant);
        return toDTO(updated);
    }
    
    @Transactional
    public void deleteTenant(String tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found with id: " + tenantId));
        tenantRepository.delete(tenant);
    }
    
    private TenantDTO toDTO(Tenant tenant) {
        return new TenantDTO(
            tenant.getTenantId(),
            tenant.getSlug(),
            tenant.getStatus(),
            tenant.getCreatedAt(),
            tenant.getUpdatedAt()
        );
    }
}