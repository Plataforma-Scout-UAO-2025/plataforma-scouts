package uao.edu.co.scouts_project.medical.record.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import uao.edu.co.scouts_project.medical.record.dto.*;
import uao.edu.co.scouts_project.medical.record.exception.MedicalRecordConflictException;
import uao.edu.co.scouts_project.medical.record.exception.MedicalRecordNotFoundException;
import uao.edu.co.scouts_project.medical.record.mapper.MedicalRecordMapper;
import uao.edu.co.scouts_project.medical.record.model.MedicalRecord;
import uao.edu.co.scouts_project.medical.record.repository.IMedicalRecordRepository;

@Service
public class MedicalRecordServiceImpl implements IMedicalRecordService {

    private static final String[] VALID_BLOOD = {"A+","A-","B+","B-","AB+","AB-","O+","O-"};

    private final IMedicalRecordRepository repo;
    private final MedicalRecordMapper mapper;

    public MedicalRecordServiceImpl(IMedicalRecordRepository repo, MedicalRecordMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    @Override
    public MedicalRecordDTO crear(String tenantId, Long memberIdPath, CreateMedicalRecordDTO dto) {
        requireTenant(tenantId);
        validateBlood(dto.bloodType());
        if (repo.existsByTenantIdAndMemberId(tenantId, memberIdPath))
            throw new MedicalRecordConflictException("member already has a medical_record in this tenant");
        MedicalRecord saved = repo.save(mapper.toDomain(tenantId, memberIdPath, dto));
        return mapper.toDto(saved);
    }

    @Override
    public MedicalRecordDTO obtenerPorMember(String tenantId, Long memberIdPath) {
        requireTenant(tenantId);
        return repo.findByTenantIdAndMemberId(tenantId, memberIdPath)
                .map(mapper::toDto)
                .orElseThrow(() -> new MedicalRecordNotFoundException(
                        "medical_record not found for tenant_id=" + tenantId + " and member_id=" + memberIdPath));
    }

    @Override
    public MedicalRecordDTO actualizar(String tenantId, Long memberIdPath, UpdateMedicalRecordDTO dto) {
        requireTenant(tenantId);
        var original = repo.findByTenantIdAndMemberId(tenantId, memberIdPath)
                .orElseThrow(() -> new MedicalRecordNotFoundException(
                        "medical_record not found for tenant_id=" + tenantId + " and member_id=" + memberIdPath));
        validateBlood(dto.bloodType());
        var reemplazo = mapper.replace(tenantId, memberIdPath, original, dto);
        var saved = repo.save(reemplazo);
        return mapper.toDto(saved);
    }

    @Override
    public void eliminar(String tenantId, Long memberIdPath, boolean hard) {
        requireTenant(tenantId);
        var original = repo.findByTenantIdAndMemberId(tenantId, memberIdPath)
                .orElseThrow(() -> new MedicalRecordNotFoundException("medical_record already deleted or does not exist"));
        if (hard) {
            repo.deleteById(original.getId());
        } else {
            var soft = new MedicalRecord(
                    original.getId(), original.getTenantId(), original.getMemberId(),
                    original.getBloodType(), original.getEps(), original.getAllergies(),
                    original.getChronicDiseases(), original.getPhysicalRestrictions(),
                    original.getSurgicalHistory(), Boolean.FALSE,
                    original.getMedicationsDetail(), original.getVaccinesDetail(),
                    original.getCreatedAt(), original.getUpdatedAt()
            );
            repo.save(soft);
        }
    }

    // ====== nuevo ======
    @Override
    public Page<MedicalRecordDTO> listarPorTenant(String tenantId, Pageable pageable) {
        requireTenant(tenantId);
        return repo.findAllByTenantId(tenantId, pageable).map(mapper::toDto);
    }

    private void requireTenant(String tenantId) {
        if (!StringUtils.hasText(tenantId)) {
            throw new IllegalArgumentException("X-Tenant-Id header is required");
        }
    }

    private void validateBlood(String bt){
        if (bt == null) throw new IllegalArgumentException("bloodType is required");
        String up = bt.trim().toUpperCase();
        for (var v : VALID_BLOOD) if (v.equals(up)) return;
        throw new IllegalArgumentException("bloodType must be one of A+,A-,B+,B-,AB+,AB-,O+,O-");
    }
}
