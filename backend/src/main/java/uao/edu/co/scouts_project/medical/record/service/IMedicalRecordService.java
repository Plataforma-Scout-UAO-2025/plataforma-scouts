package uao.edu.co.scouts_project.medical.record.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import uao.edu.co.scouts_project.medical.record.dto.*;

public interface IMedicalRecordService {
    MedicalRecordDTO crear(String tenantId, Long memberIdPath, CreateMedicalRecordDTO dto);
    MedicalRecordDTO obtenerPorMember(String tenantId, Long memberIdPath);
    MedicalRecordDTO actualizar(String tenantId, Long memberIdPath, UpdateMedicalRecordDTO dto);
    void eliminar(String tenantId, Long memberIdPath, boolean hard);

    // ===== nuevo =====
    Page<MedicalRecordDTO> listarPorTenant(String tenantId, Pageable pageable);
}
