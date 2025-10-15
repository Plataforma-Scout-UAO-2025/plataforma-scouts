package uao.edu.co.scouts_project.medical.record.mapper;

import org.springframework.stereotype.Component;
import uao.edu.co.scouts_project.medical.record.dto.*;
import uao.edu.co.scouts_project.medical.record.model.MedicalRecord;
import uao.edu.co.scouts_project.medical.record.repository.jpa.MedicalRecordEntity;

@Component
public class MedicalRecordMapper {

    // Crear → Dominio (tenantId del header, memberId del path)
    public MedicalRecord toDomain(String tenantId, Long memberIdPath, CreateMedicalRecordDTO dto) {
        return new MedicalRecord(
                dto.id(),
                tenantId,
                memberIdPath,
                dto.bloodType(),
                dto.eps(),
                dto.allergies(),
                dto.chronicDiseases(),
                dto.physicalRestrictions(),
                dto.surgicalHistory(),
                dto.active(),
                dto.medicationsDetail(),
                dto.vaccinesDetail(),
                null, null
        );
    }

    // PUT → Dominio reemplazado
    public MedicalRecord replace(String tenantId, Long memberIdPath, MedicalRecord original, UpdateMedicalRecordDTO dto) {
        return new MedicalRecord(
                original.getId(),
                tenantId,            // del header
                memberIdPath,        // del path
                dto.bloodType(),
                dto.eps(),
                dto.allergies(),
                dto.chronicDiseases(),
                dto.physicalRestrictions(),
                dto.surgicalHistory(),
                dto.active(),
                dto.medicationsDetail(),
                dto.vaccinesDetail(),
                original.getCreatedAt(),
                original.getUpdatedAt()
        );
    }

    // Dominio → DTO expuesto
    public MedicalRecordDTO toDto(MedicalRecord d) {
        return new MedicalRecordDTO(
                d.getId() == null ? null : d.getId().toString(),
                d.getTenantId(),
                d.getMemberId() == null ? null : d.getMemberId().toString(),
                d.getBloodType(),
                d.getEps(),
                d.getAllergies(),
                d.getChronicDiseases(),
                d.getPhysicalRestrictions(),
                d.getSurgicalHistory(),
                d.getActive(),
                d.getMedicationsDetail(),
                d.getVaccinesDetail(),
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }

    // Dominio → Entity JPA
    public MedicalRecordEntity toEntity(MedicalRecord d) {
        var e = new MedicalRecordEntity();
        e.setMedicalRecordId(d.getId());
        e.setTenantId(d.getTenantId());
        e.setMemberId(d.getMemberId());
        e.setBloodType(d.getBloodType());
        e.setEps(d.getEps());
        e.setAllergies(d.getAllergies());
        e.setChronicDiseases(d.getChronicDiseases());
        e.setPhysicalRestrictions(d.getPhysicalRestrictions());
        e.setSurgicalHistory(d.getSurgicalHistory());
        e.setActive(d.getActive());
        e.setMedicationsDetail(d.getMedicationsDetail());
        e.setVaccinesDetail(d.getVaccinesDetail());
        e.setCreatedAt(d.getCreatedAt());
        e.setUpdatedAt(d.getUpdatedAt());
        return e;
    }

    // Entity JPA → Dominio
    public MedicalRecord toDomain(MedicalRecordEntity e) {
        return new MedicalRecord(
                e.getMedicalRecordId(),
                e.getTenantId(),
                e.getMemberId(),
                e.getBloodType(),
                e.getEps(),
                e.getAllergies(),
                e.getChronicDiseases(),
                e.getPhysicalRestrictions(),
                e.getSurgicalHistory(),
                e.getActive(),
                e.getMedicationsDetail(),
                e.getVaccinesDetail(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
