package uao.edu.co.scouts_project.medical.mapper;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import uao.edu.co.scouts_project.medical.record.dto.*;
import uao.edu.co.scouts_project.medical.record.mapper.MedicalRecordMapper;
import uao.edu.co.scouts_project.medical.record.model.MedicalRecord;
import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;


class MedicalRecordMapperTest {

    private final MedicalRecordMapper mapper = new MedicalRecordMapper();

    @Test
    @DisplayName("toDomain(CreateMedicalRecordDTO) convierte correctamente")
    void testToDomainFromCreateDto() {
        var dto = new CreateMedicalRecordDTO(
                123L, "O+", "SURA", "Polvo", "Asma", "Ninguna", "Apendicectomía", true,
                List.of(new MedicationDTO("Ibuprofeno", "1/día")),
                List.of(new VaccineDTO("Tétanos", "2023-06-12"))
        );

        var domain = mapper.toDomain("tenant-1", 123L, dto);

        assertEquals("tenant-1", domain.getTenantId());
        assertEquals(123L, domain.getMemberId());
        assertEquals("O+", domain.getBloodType());
    }

    @Test
    @DisplayName("replace actualiza correctamente con UpdateMedicalRecordDTO")
    void testReplace() {
        var original = new MedicalRecord(1L, "tenant-1", 123L, "A+", "SURA", "Polvo", "Asma",
                "Ninguna", "Cirugía 2020", true, List.of(), List.of(),
                OffsetDateTime.now(), OffsetDateTime.now());

        var updateDto = new UpdateMedicalRecordDTO("O-", "Nueva EPS", "Ninguna", "Sin asma",
                "Evitar esfuerzo", "Apendicectomía", false, List.of(), List.of());

        var result = mapper.replace("tenant-1", 123L, original, updateDto);

        assertEquals("O-", result.getBloodType());
        assertEquals("Nueva EPS", result.getEps());
        assertEquals(false, result.getActive());
    }

    @Test
    @DisplayName("toDto convierte correctamente MedicalRecord → DTO")
    void testToDto() {
        var domain = new MedicalRecord(1L, "tenant-1", 123L, "O+", "SURA", "Polvo", "Asma",
                "Ninguna", "Cirugía", true, List.of(), List.of(),
                OffsetDateTime.now(), OffsetDateTime.now());

        var dto = mapper.toDto(domain);

        assertEquals("1", dto.id());
        assertEquals("tenant-1", dto.tenantId());
        assertEquals("123", dto.memberId());
    }

    @Test
    @DisplayName("toEntity y toDomain mantienen los valores")
    void testToEntityAndBack() {
        var domain = new MedicalRecord(1L, "tenant-1", 123L, "O+", "SURA", "Polvo", "Asma",
                "Ninguna", "Cirugía", true, List.of(), List.of(),
                OffsetDateTime.now(), OffsetDateTime.now());

        var entity = mapper.toEntity(domain);
        var result = mapper.toDomain(entity);

        assertEquals(domain.getId(), result.getId());
        assertEquals(domain.getBloodType(), result.getBloodType());
        assertEquals(domain.getAllergies(), result.getAllergies());
    }
}
