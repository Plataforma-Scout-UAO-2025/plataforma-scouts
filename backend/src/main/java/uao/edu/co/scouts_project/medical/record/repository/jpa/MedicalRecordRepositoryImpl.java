package uao.edu.co.scouts_project.medical.record.repository.jpa;

import org.springframework.stereotype.Repository;
import uao.edu.co.scouts_project.medical.record.mapper.MedicalRecordMapper;
import uao.edu.co.scouts_project.medical.record.model.MedicalRecord;
import uao.edu.co.scouts_project.medical.record.repository.IMedicalRecordRepository;

import java.util.Optional;

@Repository
public class MedicalRecordRepositoryImpl implements IMedicalRecordRepository {

    private final SpringDataMedicalRecordJpaRepository jpa;
    private final MedicalRecordMapper mapper;

    public MedicalRecordRepositoryImpl(SpringDataMedicalRecordJpaRepository jpa, MedicalRecordMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public MedicalRecord save(MedicalRecord record) {
        var saved = jpa.save(mapper.toEntity(record));
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<MedicalRecord> findByTenantIdAndMemberId(String tenantId, Long memberId) {
        return jpa.findByTenantIdAndMemberId(tenantId, memberId).map(mapper::toDomain);
    }

    @Override
    public boolean existsByTenantIdAndMemberId(String tenantId, Long memberId) {
        return jpa.existsByTenantIdAndMemberId(tenantId, memberId);
    }

    @Override
    public void deleteById(Long id) {
        jpa.deleteById(id);
    }
}
