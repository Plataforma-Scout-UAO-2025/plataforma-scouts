package uao.edu.co.scouts_project.medical.record.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import uao.edu.co.scouts_project.medical.record.model.MedicalRecord;

import java.util.Optional;

public interface IMedicalRecordRepository {
    MedicalRecord save(MedicalRecord record);
    Optional<MedicalRecord> findByTenantIdAndMemberId(String tenantId, Long memberId);
    boolean existsByTenantIdAndMemberId(String tenantId, Long memberId);
    void deleteById(Long id);

    // ===== nuevo para listados por tenant con paginación =====
    Page<MedicalRecord> findAllByTenantId(String tenantId, Pageable pageable);
}
