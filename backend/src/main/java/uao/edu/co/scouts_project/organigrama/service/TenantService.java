package uao.edu.co.scouts_project.organigrama.service;

import uao.edu.co.scouts_project.domain.exception.auth0.ResourceNotFoundException;
import uao.edu.co.scouts_project.organigrama.dto.TenantDTO;
import uao.edu.co.scouts_project.organigrama.dto.TenantInfoDTO;
import uao.edu.co.scouts_project.organigrama.interfaces.ITenantService;
import uao.edu.co.scouts_project.organigrama.model.Tenant;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TenantService implements ITenantService {

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
                .orElseThrow(() -> new IllegalArgumentException("Tenant no encontrado: " + tenantId));
        return toDTO(tenant);
    }
    
    @Transactional(readOnly = true)
    public String getTenantIdBySlug(String slug) {
        Tenant tenant = tenantRepository.findBySlug(slug)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found with slug: " + slug));
        return tenant.getTenantId();
    }

    @Transactional
    public TenantDTO createTenant(TenantDTO dto) {
        if (tenantRepository.existsBySlug(dto.slug())) {
            throw new IllegalArgumentException("Tenant con SLUG '" + dto.slug() + "' ya existe");
        }

        Tenant tenant = new Tenant(dto.slug());
        if (dto.status() != null) {
            tenant.setStatus(dto.status());
        }

        Tenant saved = tenantRepository.save(tenant);
        return toDTO(saved);
    }

    @Transactional
    public TenantDTO createTenantInfo(TenantInfoDTO dto) {

        String tenantId = dto.getTenantId();
        String slug = dto.getSlug();
        String tenantStatus = dto.getStatus();

        if (tenantRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Tenant with slug '" + slug + "' already exists");
        }

        Tenant tenant = new Tenant(tenantId, slug);
        if (tenantStatus != null) {
            tenant.setStatus(tenantStatus);
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
    public TenantDTO updateTenantInfo(String tenantId, TenantInfoDTO dto) {

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant no encontrado"));

        // Validar unicidad del slug si se intenta cambiar
        if (dto.getSlug() != null && !dto.getSlug().equals(tenant.getSlug())) {
            if (tenantRepository.existsBySlug(dto.getSlug())) {
                throw new IllegalArgumentException("Tenant con SLUG '" + dto.getSlug() + "' ya existe");
            }
        }

        if (dto.getSlug() != null)
            tenant.setSlug(dto.getSlug());
        if (dto.getStatus() != null)
            tenant.setStatus(dto.getStatus());
        if (dto.getUpdatedAt() != null)
            tenant.setUpdatedAt(dto.getUpdatedAt());
        else
            tenant.setUpdatedAt(Instant.now());

        Tenant saved = tenantRepository.save(tenant);
        return toDTO(saved);
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
                tenant.getUpdatedAt());
    }
}