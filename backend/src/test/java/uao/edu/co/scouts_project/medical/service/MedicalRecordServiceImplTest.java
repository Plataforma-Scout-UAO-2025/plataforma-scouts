package uao.edu.co.scouts_project.medical.record.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MedicalRecordServiceImplTest {

    @Mock
    private IMedicalRecordRepository repo;

    @Mock
    private MedicalRecordMapper mapper;

    @InjectMocks
    private MedicalRecordServiceImpl service;

    private static final String TENANT_ID = "tenant-123";
    private static final Long MEMBER_ID = 456L;

    private MedicalRecord dominioStub() {
        return new MedicalRecord(
                900001L, TENANT_ID, MEMBER_ID,
                "O+", "SURA", "Maní", "Asma", "Ninguna", "Apendicectomía 2018",
                true,
                List.of(new MedicationDTO("Salbutamol","2/día")),
                List.of(new VaccineDTO("Tétanos","2023-06-12")),
                OffsetDateTime.parse("2024-01-01T00:00:00Z"),
                OffsetDateTime.parse("2024-01-01T00:00:00Z")
        );
    }

    private MedicalRecordDTO dtoStub() {
        return new MedicalRecordDTO(
                "900001",
                TENANT_ID,
                MEMBER_ID.toString(),
                "O+", "SURA", "Maní", "Asma", "Ninguna", "Apendicectomía 2018",
                true,
                List.of(new MedicationDTO("Salbutamol","2/día")),
                List.of(new VaccineDTO("Tétanos","2023-06-12")),
                OffsetDateTime.parse("2024-01-01T00:00:00Z"),
                OffsetDateTime.parse("2024-01-01T00:00:00Z")
        );
    }

    // ------------------------- CREAR -------------------------
    @Test
    @DisplayName("crear: OK cuando no existe (tenantId, memberId)")
    void crear_ok() {
        var req = new CreateMedicalRecordDTO(
                MEMBER_ID, "O+", "SURA", "Maní", "Asma", "Ninguna", "Apendicectomía 2018",
                true,
                List.of(new MedicationDTO("Salbutamol","2/día")),
                List.of(new VaccineDTO("Tétanos","2023-06-12"))
        );

        when(repo.existsByTenantIdAndMemberId(TENANT_ID, MEMBER_ID)).thenReturn(false);
        when(mapper.toDomain(TENANT_ID, MEMBER_ID, req)).thenReturn(dominioStub());
        when(repo.save(any(MedicalRecord.class))).thenReturn(dominioStub());
        when(mapper.toDto(any(MedicalRecord.class))).thenReturn(dtoStub());

        var res = service.crear(TENANT_ID, MEMBER_ID, req);

        assertEquals(TENANT_ID, res.tenantId());
        assertEquals(MEMBER_ID.toString(), res.memberId());
        assertEquals("O+", res.bloodType());
    }

    @Test
    @DisplayName("crear: 409 si ya existe (tenantId, memberId)")
    void crear_conflict() {
        var req = new CreateMedicalRecordDTO(MEMBER_ID, "O+", null, null, null, null, null, true, List.of(), List.of());
        when(repo.existsByTenantIdAndMemberId(TENANT_ID, MEMBER_ID)).thenReturn(true);

        assertThrows(MedicalRecordConflictException.class,
                () -> service.crear(TENANT_ID, MEMBER_ID, req));
    }

    @Test
    @DisplayName("crear: 400 si tenantId vacío/null")
    void crear_tenant_required() {
        var req = new CreateMedicalRecordDTO(MEMBER_ID, "O+", null, null, null, null, null, true, List.of(), List.of());
        assertThrows(IllegalArgumentException.class, () -> service.crear("", MEMBER_ID, req));
        assertThrows(IllegalArgumentException.class, () -> service.crear(null, MEMBER_ID, req));
    }

    @Test
    @DisplayName("crear: 400 si bloodType inválido")
    void crear_blood_invalid() {
        var req = new CreateMedicalRecordDTO(MEMBER_ID, "X1", null, null, null, null, null, true, List.of(), List.of());
        assertThrows(IllegalArgumentException.class,
                () -> service.crear(TENANT_ID, MEMBER_ID, req));
    }

    // ------------------------- OBTENER -------------------------
    @Test
    @DisplayName("obtenerPorMember: OK cuando existe")
    void obtener_ok() {
        when(repo.findByTenantIdAndMemberId(TENANT_ID, MEMBER_ID)).thenReturn(Optional.of(dominioStub()));
        when(mapper.toDto(any(MedicalRecord.class))).thenReturn(dtoStub());

        var res = service.obtenerPorMember(TENANT_ID, MEMBER_ID);
        assertEquals(TENANT_ID, res.tenantId());
        assertEquals(MEMBER_ID.toString(), res.memberId());
    }

    @Test
    @DisplayName("obtenerPorMember: 404 cuando no existe")
    void obtener_not_found() {
        when(repo.findByTenantIdAndMemberId(anyString(), anyLong())).thenReturn(Optional.empty());
        assertThrows(MedicalRecordNotFoundException.class,
                () -> service.obtenerPorMember(TENANT_ID, MEMBER_ID));
    }

    // ------------------------- ACTUALIZAR -------------------------
    @Test
    @DisplayName("actualizar: OK cuando existe")
    void actualizar_ok() {
        var upd = new UpdateMedicalRecordDTO(
                "O+", "SURA Plan Oro", "Maní, Penicilina", "Asma", "Evitar esfuerzo extremo", "Apendicectomía 2018",
                true, List.of(new MedicationDTO("Salbutamol","1/día")),
                List.of(new VaccineDTO("Fiebre amarilla","2024-02-01"))
        );

        when(repo.findByTenantIdAndMemberId(TENANT_ID, MEMBER_ID)).thenReturn(Optional.of(dominioStub()));
        when(mapper.replace(eq(TENANT_ID), eq(MEMBER_ID), any(MedicalRecord.class), eq(upd)))
                .thenReturn(dominioStub());
        when(repo.save(any(MedicalRecord.class))).thenReturn(dominioStub());
        when(mapper.toDto(any(MedicalRecord.class))).thenReturn(dtoStub());

        var res = service.actualizar(TENANT_ID, MEMBER_ID, upd);
        assertEquals("O+", res.bloodType());
    }

    @Test
    @DisplayName("actualizar: 404 cuando no existe")
    void actualizar_not_found() {
        when(repo.findByTenantIdAndMemberId(anyString(), anyLong())).thenReturn(Optional.empty());
        var upd = new UpdateMedicalRecordDTO("O+", null, null, null, null, null, true, List.of(), List.of());
        assertThrows(MedicalRecordNotFoundException.class,
                () -> service.actualizar(TENANT_ID, MEMBER_ID, upd));
    }

    @Test
    @DisplayName("actualizar: 400 cuando bloodType inválido")
    void actualizar_blood_invalid() {
        when(repo.findByTenantIdAndMemberId(anyString(), anyLong())).thenReturn(Optional.of(dominioStub()));
        var upd = new UpdateMedicalRecordDTO("AA", null, null, null, null, null, true, List.of(), List.of());
        assertThrows(IllegalArgumentException.class,
                () -> service.actualizar(TENANT_ID, MEMBER_ID, upd));
    }

    // ------------------------- ELIMINAR -------------------------
    @Test
    @DisplayName("eliminar: hard delete OK")
    void eliminar_hard_ok() {
        when(repo.findByTenantIdAndMemberId(TENANT_ID, MEMBER_ID)).thenReturn(Optional.of(dominioStub()));

        service.eliminar(TENANT_ID, MEMBER_ID, true);

        // Verifica que deleteById fue llamado
        verify(repo).deleteById(dominioStub().getId());
    }

    @Test
    @DisplayName("eliminar: soft delete OK")
    void eliminar_soft_ok() {
        when(repo.findByTenantIdAndMemberId(TENANT_ID, MEMBER_ID)).thenReturn(Optional.of(dominioStub()));
        when(repo.save(any(MedicalRecord.class))).thenReturn(dominioStub());

        service.eliminar(TENANT_ID, MEMBER_ID, false);

        // Verifica que save fue llamado con objeto modificado
        verify(repo).save(any(MedicalRecord.class));
    }

    @Test
    @DisplayName("eliminar: 404 si no existe")
    void eliminar_not_found() {
        when(repo.findByTenantIdAndMemberId(anyString(), anyLong())).thenReturn(Optional.empty());

        assertThrows(MedicalRecordNotFoundException.class,
                () -> service.eliminar(TENANT_ID, MEMBER_ID, true));
    }

}
