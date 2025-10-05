package uao.edu.co.scouts_project.common.controller.medical.record;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import uao.edu.co.scouts_project.medical.record.controller.MedicalRecordController;
import uao.edu.co.scouts_project.medical.record.dto.*;
import uao.edu.co.scouts_project.medical.record.service.IMedicalRecordService;

import java.time.OffsetDateTime;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MedicalRecordController.class)
@AutoConfigureMockMvc(addFilters = false) // ignora filtros de seguridad en estas pruebas
class MedicalRecordControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper om;

    @MockBean
    IMedicalRecordService service;

    private MedicalRecordDTO stubDto() {
        return new MedicalRecordDTO(
                "900001", "tenant-123", "456",
                "O+","SURA","Maní","Asma","Ninguna",
                "Apendicectomía 2018", true,
                List.of(new MedicationDTO("Salbutamol","2/día")),
                List.of(new VaccineDTO("Tétanos","2023-06-12")),
                OffsetDateTime.parse("2024-01-01T00:00:00Z"),
                OffsetDateTime.parse("2024-01-01T00:00:00Z")
        );
    }

    @Test
    @DisplayName("POST create_record: 200 con DTO cuando X-Tenant-Id y payload son válidos")
    void create_ok() throws Exception {
        var req = new CreateMedicalRecordDTO(
                900001L, "O+","SURA","Maní","Asma","Ninguna","Apendicectomía 2018",
                true,
                List.of(new MedicationDTO("Salbutamol","2/día")),
                List.of(new VaccineDTO("Tétanos","2023-06-12"))
        );

        Mockito.when(service.crear(eq("tenant-123"), eq(456L), any(CreateMedicalRecordDTO.class)))
                .thenReturn(stubDto());

        mockMvc.perform(post("/api/medical_record/create_record/{memberId}", 456L)
                        .header("X-Tenant-Id", "tenant-123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId", is("tenant-123")))
                .andExpect(jsonPath("$.memberId", is("456")))
                .andExpect(jsonPath("$.bloodType", is("O+")));
    }

    @Test
    @DisplayName("GET list_record: 200 con DTO cuando X-Tenant-Id está presente")
    void get_ok() throws Exception {
        Mockito.when(service.obtenerPorMember("tenant-123", 456L))
                .thenReturn(stubDto());

        mockMvc.perform(get("/api/medical_record/list_record/{memberId}", 456L)
                        .header("X-Tenant-Id", "tenant-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId", is("tenant-123")))
                .andExpect(jsonPath("$.memberId", is("456")));
    }

    @Test
    @DisplayName("PUT update_record: 200 con DTO cuando X-Tenant-Id y payload son válidos")
    void update_ok() throws Exception {
        var req = new UpdateMedicalRecordDTO(
                "O+","SURA Plan Oro","Maní, Penicilina","Asma","Evitar esfuerzo extremo",
                "Apendicectomía 2018", true,
                List.of(new MedicationDTO("Salbutamol","1/día")),
                List.of(new VaccineDTO("Fiebre amarilla","2024-02-01"))
        );

        Mockito.when(service.actualizar(eq("tenant-123"), eq(456L), any(UpdateMedicalRecordDTO.class)))
                .thenReturn(stubDto());

        mockMvc.perform(put("/api/medical_record/update_record/{memberId}", 456L)
                        .header("X-Tenant-Id", "tenant-123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bloodType", is("O+")));
    }

    @Test
    @DisplayName("Falta X-Tenant-Id: 400 Bad Request")
    void missing_tenant_header_returns_400() throws Exception {
        mockMvc.perform(get("/api/medical_record/list_record/{memberId}", 456L))
                .andExpect(status().isBadRequest());
    }
}
