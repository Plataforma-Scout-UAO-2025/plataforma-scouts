package uao.edu.co.scouts_project.medical.record.repository;

import uao.edu.co.scouts_project.medical.record.model.MedicalRecord;

import java.util.Optional;

public interface IMedicalRecordRepository {
    MedicalRecord save(MedicalRecord record);
    Optional<MedicalRecord> findByTenantIdAndMemberId(String tenantId, Long memberId);
    boolean existsByTenantIdAndMemberId(String tenantId, Long memberId);
    void deleteById(Long id);
}
