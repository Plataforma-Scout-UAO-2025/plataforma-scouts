package uao.edu.co.scouts_project.medical.record.repository.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpringDataMedicalRecordJpaRepository extends JpaRepository<MedicalRecordEntity, Long> {
    Optional<MedicalRecordEntity> findByTenantIdAndMemberId(String tenantId, Long memberId);
    boolean existsByTenantIdAndMemberId(String tenantId, Long memberId);
}
