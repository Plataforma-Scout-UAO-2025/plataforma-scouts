package uao.edu.co.scouts_project.medical.record.service;

import uao.edu.co.scouts_project.medical.record.dto.*;

public interface IMedicalRecordService {
    MedicalRecordDTO crear(String tenantId, Long memberIdPath, CreateMedicalRecordDTO dto);
    MedicalRecordDTO obtenerPorMember(String tenantId, Long memberIdPath);
    MedicalRecordDTO actualizar(String tenantId, Long memberIdPath, UpdateMedicalRecordDTO dto);
    void eliminar(String tenantId, Long memberIdPath, boolean hard); // si luego habilitan DELETE
}
