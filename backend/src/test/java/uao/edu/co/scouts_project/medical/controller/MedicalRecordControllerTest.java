package uao.edu.co.scouts_project.medical.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import uao.edu.co.scouts_project.medical.record.controller.MedicalRecordController;
import uao.edu.co.scouts_project.medical.record.dto.*;
import uao.edu.co.scouts_project.medical.record.service.IMedicalRecordService;

import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// 🚫 Excluimos la seguridad y los filtros de tenant
@WebMvcTest(
        controllers = MedicalRecordController.class,
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*SecurityConfig"),
                @ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*TenantFilter")
        }
)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class MedicalRecordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IMedicalRecordService service;

    private MedicalRecordDTO dtoStub() {
        return new MedicalRecordDTO(
                "900001", "tenant-123", "456",
                "O+", "SURA", "Maní", "Asma", "Ninguna", "Apendicectomía",
                true, List.of(), List.of(),
                OffsetDateTime.now(), OffsetDateTime.now()
        );
    }

    @Test
    @DisplayName("POST /create_record/{memberId} retorna 200 OK")
    void testCreate() throws Exception {
        when(service.crear(anyString(), anyLong(), any(CreateMedicalRecordDTO.class)))
                .thenReturn(dtoStub());

        String json = """
                {
                  "memberId": 456,
                  "bloodType": "O+",
                  "eps": "SURA",
                  "allergies": "Maní",
                  "chronicDiseases": "Asma",
                  "physicalRestrictions": "Ninguna",
                  "surgicalHistory": "Apendicectomía",
                  "active": true,
                  "medicationsDetail": [],
                  "vaccinesDetail": []
                }
                """;

        mockMvc.perform(post("/api/v1/medical_record/create_record/456")
                        .header("X-Tenant-Id", "tenant-123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value("tenant-123"));
    }

    @Test
    @DisplayName("GET /list_record/{memberId} retorna ficha médica")
    void testGet() throws Exception {
        when(service.obtenerPorMember(anyString(), anyLong())).thenReturn(dtoStub());

        mockMvc.perform(get("/api/v1/medical_record/list_record/456")
                        .header("X-Tenant-Id", "tenant-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("900001"));
    }

    @Test
    @DisplayName("PUT /update_record/{memberId} retorna 200 OK")
    void testUpdate() throws Exception {
        when(service.actualizar(anyString(), anyLong(), any(UpdateMedicalRecordDTO.class)))
                .thenReturn(dtoStub());

        String json = """
                {
                  "bloodType": "O+",
                  "eps": "SURA",
                  "allergies": "Maní",
                  "chronicDiseases": "Asma",
                  "physicalRestrictions": "Ninguna",
                  "surgicalHistory": "Apendicectomía",
                  "active": true,
                  "medicationsDetail": [],
                  "vaccinesDetail": []
                }
                """;

        mockMvc.perform(put("/api/v1/medical_record/update_record/456")
                        .header("X-Tenant-Id", "tenant-123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("900001"));
    }

    @Test
    @DisplayName("GET /list_by_tenant retorna 200 OK y página de resultados")
    void testListByTenant() throws Exception {
        when(service.listarPorTenant(anyString(), any()))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(dtoStub())));

        mockMvc.perform(get("/api/v1/medical_record/list_by_tenant")
                        .header("X-Tenant-Id", "tenant-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value("900001"));
    }
}
