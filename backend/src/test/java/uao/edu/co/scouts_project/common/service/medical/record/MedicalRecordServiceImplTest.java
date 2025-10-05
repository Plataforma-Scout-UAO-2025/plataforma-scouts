package uao.edu.co.scouts_project.common.service.medical.record;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import uao.edu.co.scouts_project.medical.record.dto.*;
import uao.edu.co.scouts_project.medical.record.exception.MedicalRecordConflictException;
import uao.edu.co.scouts_project.medical.record.exception.MedicalRecordNotFoundException;
import uao.edu.co.scouts_project.medical.record.mapper.MedicalRecordMapper;
import uao.edu.co.scouts_project.medical.record.model.MedicalRecord;
import uao.edu.co.scouts_project.medical.record.repository.IMedicalRecordRepository;
import uao.edu.co.scouts_project.medical.record.service.MedicalRecordServiceImpl;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class MedicalRecordServiceImplTest {

    IMedicalRecordRepository repo;
    MedicalRecordMapper mapper;
    MedicalRecordServiceImpl service;

    @BeforeEach
    void setUp() {
        repo = Mockito.mock(IMedicalRecordRepository.class);
        mapper = Mockito.mock(MedicalRecordMapper.class);
        service = new MedicalRecordServiceImpl(repo, mapper);
    }

    private MedicalRecord dominioStub() {
        return new MedicalRecord(
                900001L, "tenant-123", 456L,
                "O+","SURA","Maní","Asma","Ninguna","Apendicectomía 2018",
                true,
                List.of(new MedicationDTO("Salbutamol","2/día")),
                List.of(new VaccineDTO("Tétanos","2023-06-12")),
                OffsetDateTime.parse("2024-01-01T00:00:00Z"),
                OffsetDateTime.parse("2024-01-01T00:00:00Z")
        );
    }

    private MedicalRecordDTO dtoStub() {
        return new MedicalRecordDTO(
                "900001", "tenant-123", "456",
                "O+","SURA","Maní","Asma","Ninguna","Apendicectomía 2018",
                true,
                List.of(new MedicationDTO("Salbutamol","2/día")),
                List.of(new VaccineDTO("Tétanos","2023-06-12")),
                OffsetDateTime.parse("2024-01-01T00:00:00Z"),
                OffsetDateTime.parse("2024-01-01T00:00:00Z")
        );
    }

    @Test
    @DisplayName("crear: OK cuando no existe (tenantId, memberId)")
    void crear_ok() {
        var req = new CreateMedicalRecordDTO(
                900001L, "O+","SURA","Maní","Asma","Ninguna","Apendicectomía 2018",
                true,
                List.of(new MedicationDTO("Salbutamol","2/día")),
                List.of(new VaccineDTO("Tétanos","2023-06-12"))
        );

        when(repo.existsByTenantIdAndMemberId("tenant-123", 456L)).thenReturn(false);
        when(mapper.toDomain("tenant-123", 456L, req)).thenReturn(dominioStub());
        when(repo.save(any(MedicalRecord.class))).thenReturn(dominioStub());
        when(mapper.toDto(any(MedicalRecord.class))).thenReturn(dtoStub());

        var res = service.crear("tenant-123", 456L, req);

        assertEquals("tenant-123", res.tenantId());
        assertEquals("456", res.memberId());
        assertEquals("O+", res.bloodType());
    }

    @Test
    @DisplayName("crear: 409 si ya existe (tenantId, memberId)")
    void crear_conflict() {
        var req = new CreateMedicalRecordDTO(900001L, "O+", null, null, null, null, null, true, List.of(), List.of());
        when(repo.existsByTenantIdAndMemberId("tenant-123", 456L)).thenReturn(true);

        assertThrows(MedicalRecordConflictException.class,
                () -> service.crear("tenant-123", 456L, req));
    }

    @Test
    @DisplayName("crear: 400 si tenantId vacío/null")
    void crear_tenant_required() {
        var req = new CreateMedicalRecordDTO(900001L, "O+", null, null, null, null, null, true, List.of(), List.of());
        assertThrows(IllegalArgumentException.class, () -> service.crear("", 456L, req));
        assertThrows(IllegalArgumentException.class, () -> service.crear(null, 456L, req));
    }

    @Test
    @DisplayName("crear: 400 si bloodType inválido")
    void crear_blood_invalid() {
        var req = new CreateMedicalRecordDTO(900001L, "X1", null, null, null, null, null, true, List.of(), List.of());
        assertThrows(IllegalArgumentException.class,
                () -> service.crear("tenant-123", 456L, req));
    }

    @Test
    @DisplayName("obtenerPorMember: OK cuando existe")
    void obtener_ok() {
        when(repo.findByTenantIdAndMemberId("tenant-123", 456L)).thenReturn(Optional.of(dominioStub()));
        when(mapper.toDto(any(MedicalRecord.class))).thenReturn(dtoStub());

        var res = service.obtenerPorMember("tenant-123", 456L);
        assertEquals("tenant-123", res.tenantId());
        assertEquals("456", res.memberId());
    }

    @Test
    @DisplayName("obtenerPorMember: 404 cuando no existe")
    void obtener_not_found() {
        when(repo.findByTenantIdAndMemberId(anyString(), anyLong())).thenReturn(Optional.empty());
        assertThrows(MedicalRecordNotFoundException.class,
                () -> service.obtenerPorMember("tenant-123", 456L));
    }

    @Test
    @DisplayName("actualizar: OK cuando existe")
    void actualizar_ok() {
        var upd = new UpdateMedicalRecordDTO(
                "O+","SURA Plan Oro","Maní, Penicilina","Asma","Evitar esfuerzo extremo","Apendicectomía 2018",
                true, List.of(new MedicationDTO("Salbutamol","1/día")),
                List.of(new VaccineDTO("Fiebre amarilla","2024-02-01"))
        );

        when(repo.findByTenantIdAndMemberId("tenant-123", 456L)).thenReturn(Optional.of(dominioStub()));
        when(mapper.replace(eq("tenant-123"), eq(456L), any(MedicalRecord.class), eq(upd))).thenReturn(dominioStub());
        when(repo.save(any(MedicalRecord.class))).thenReturn(dominioStub());
        when(mapper.toDto(any(MedicalRecord.class))).thenReturn(dtoStub());

        var res = service.actualizar("tenant-123", 456L, upd);
        assertEquals("O+", res.bloodType());
    }

    @Test
    @DisplayName("actualizar: 404 cuando no existe")
    void actualizar_not_found() {
        when(repo.findByTenantIdAndMemberId(anyString(), anyLong())).thenReturn(Optional.empty());
        var upd = new UpdateMedicalRecordDTO("O+", null, null, null, null, null, true, List.of(), List.of());
        assertThrows(MedicalRecordNotFoundException.class,
                () -> service.actualizar("tenant-123", 456L, upd));
    }

    @Test
    @DisplayName("actualizar: 400 cuando bloodType inválido")
    void actualizar_blood_invalid() {
        when(repo.findByTenantIdAndMemberId(anyString(), anyLong())).thenReturn(Optional.of(dominioStub()));
        var upd = new UpdateMedicalRecordDTO("AA", null, null, null, null, null, true, List.of(), List.of());
        assertThrows(IllegalArgumentException.class,
                () -> service.actualizar("tenant-123", 456L, upd));
    }
}
