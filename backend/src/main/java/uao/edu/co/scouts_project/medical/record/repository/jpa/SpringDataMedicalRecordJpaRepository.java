package uao.edu.co.scouts_project.medical.record.repository.jpa;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import uao.edu.co.scouts_project.medical.record.repository.jpa.MedicalRecordEntity;

import java.util.Optional;

public interface SpringDataMedicalRecordJpaRepository extends JpaRepository<MedicalRecordEntity, Long> {

    Optional<MedicalRecordEntity> findByTenantIdAndMemberId(String tenantId, Long memberId);

    boolean existsByTenantIdAndMemberId(String tenantId, Long memberId);

    // ===== nuevo =====
    Page<MedicalRecordEntity> findAllByTenantId(String tenantId, Pageable pageable);
}
