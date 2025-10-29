package uao.edu.co.scouts_project.finanzas.fees.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

import uao.edu.co.scouts_project.finanzas.fees.data.TestData;
import uao.edu.co.scouts_project.finanzas.fees.dto.CuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.IdNameDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.MemberPaymentDto;
import uao.edu.co.scouts_project.finanzas.fees.service.IFeeService;

@ExtendWith(MockitoExtension.class)
class FeesControllerTest {

  private MockMvc mvc;
  private ObjectMapper om;

  @Mock
  IFeeService feeService;

  @InjectMocks
  FeesController controller;

  @BeforeEach
  void setup() {
    om = new ObjectMapper();
    om.registerModule(new JavaTimeModule());                    // Soporte java.time.*
    om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // "yyyy-MM-dd" en vez de epoch

    mvc = MockMvcBuilders.standaloneSetup(controller)
        .setControllerAdvice(new TestExceptionHandler())
        .build();
  }

  /** Handler mínimo para el test: IAE -> 400 */
  @ControllerAdvice
  static class TestExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public Map<String, Object> handleIllegalArgument(IllegalArgumentException ex) {
      Map<String, Object> body = new HashMap<>();
      body.put("status", 400);
      body.put("message", ex.getMessage());
      return body;
    }
  }

  @Test
  void post_create_returns201() throws Exception {
    var dto = TestData.createALL("org_TENANT");
    when(feeService.create(any())).thenReturn(org.mockito.Mockito.mock(CuotaDto.class));

    mvc.perform(post("/api/v1/finanzas/fees")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(dto)))
        .andExpect(status().isCreated());
  }

  @Test
  void get_feesByTenant_ok() throws Exception {
    when(feeService.listFeesByTenant("org_TENANT"))
        .thenReturn(Collections.emptyList());

    mvc.perform(get("/api/v1/finanzas/fees/org_TENANT"))
        .andExpect(status().isOk());
  }

  @Test
  void get_membersByTenant_ok() throws Exception {
    when(feeService.listMembersByTenant("org_TENANT"))
        .thenReturn(Collections.<MemberPaymentDto>emptyList());

    mvc.perform(get("/api/v1/finanzas/fees/members/org_TENANT"))
        .andExpect(status().isOk());
  }

  @Test
  void get_subgroupsByTenant_ok() throws Exception {
    when(feeService.listSubgroupsByTenant("org_TENANT"))
        .thenReturn(Collections.<IdNameDto>emptyList());

    mvc.perform(get("/api/v1/finanzas/fees/subgroups/org_TENANT"))
        .andExpect(status().isOk());
  }

  @Test
  void get_sectionsByTenant_ok() throws Exception {
    when(feeService.listSectionsByTenant("org_TENANT"))
        .thenReturn(Collections.<IdNameDto>emptyList());

    mvc.perform(get("/api/v1/finanzas/fees/sections/org_TENANT"))
        .andExpect(status().isOk());
  }

  @Test
  void post_create_returns400_whenServiceThrowsIAE() throws Exception {
    when(feeService.create(any())).thenThrow(new IllegalArgumentException("bad"));

    mvc.perform(post("/api/v1/finanzas/fees")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{}"))
      .andExpect(status().isBadRequest());
  }

  @Test
  void post_create_returns409_whenUniqueConstraintViolation() throws Exception {
    when(feeService.create(any()))
        .thenThrow(new org.springframework.dao.DataIntegrityViolationException("uq_installment_per_account_concept_date"));

    mvc.perform(post("/api/v1/finanzas/fees")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.error").value("unique_constraint_violation"))
        .andExpect(jsonPath("$.constraint").value("uq_installment_per_account_concept_date"))
        .andExpect(jsonPath("$.message").value("Ya existe una cuota para este account, concepto y fecha"));
  }

  @Test
  void patch_updates_and_returns200() throws Exception {
    var dto = new CuotaDto(
        123L,
        new BigDecimal("100000"),
        "Nombre cuota",
        "Descripción",
        "SECTION",
        "MONTHLY",
        java.time.LocalDate.of(2025,10,1),
        java.time.LocalDate.of(2025,12,31),
        JsonNodeFactory.instance.arrayNode()
    );

    when(feeService.patch(
            org.mockito.ArgumentMatchers.eq(123L),
            org.mockito.ArgumentMatchers.any(CuotaDto.class),
            org.mockito.ArgumentMatchers.eq("org_TENANT")))
        .thenReturn(dto);

    mvc.perform(patch("/api/v1/finanzas/fees/{tenantId}/{feePlanId}", "org_TENANT", 123L)
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(dto)))
        .andExpect(status().isOk());

    org.mockito.Mockito.verify(feeService)
        .patch(org.mockito.ArgumentMatchers.eq(123L),
              org.mockito.ArgumentMatchers.any(CuotaDto.class),
              org.mockito.ArgumentMatchers.eq("org_TENANT"));
  }

  @Test
  void delete_removes_and_returns204() throws Exception {
    mvc.perform(delete("/api/v1/finanzas/fees/{tenantId}/{feePlanId}", "org_TENANT", 777L))
        .andExpect(status().isNoContent());

    org.mockito.Mockito.verify(feeService)
        .deleteFeePlan(org.mockito.ArgumentMatchers.eq(777L),
                      org.mockito.ArgumentMatchers.eq("org_TENANT"));
  }

  // ============================
  // NUEVOS TESTS PARA COBERTURA
  // ============================

  @Test
  void delete_returns404_whenFeePlanNotFound() throws Exception {
    // Simula que el servicio lanza NoSuchElementException -> controller devuelve 404
    org.mockito.Mockito.doThrow(new NoSuchElementException("FeePlan not found for this tenant"))
        .when(feeService).deleteFeePlan(999L, "org_TENANT");

    mvc.perform(delete("/api/v1/finanzas/fees/{tenantId}/{feePlanId}", "org_TENANT", 999L))
        .andExpect(status().isNotFound());
  }

  @Test
  void delete_returns409_withBody_whenServiceThrowsResponseStatus() throws Exception {
    // Simula que el servicio lanza 409; lo captura el @ExceptionHandler local del controller
    org.mockito.Mockito.doThrow(new ResponseStatusException(
        HttpStatus.CONFLICT,
        "No se puede eliminar la cuota (FeePlan) porque existen pagos asociados en sus cuotas (installments)."
    )).when(feeService).deleteFeePlan(123L, "org_TENANT");

    mvc.perform(delete("/api/v1/finanzas/fees/{tenantId}/{feePlanId}", "org_TENANT", 123L))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.status").value(409))
        .andExpect(jsonPath("$.error").value("CONFLICT"))
        .andExpect(jsonPath("$.message").value(
            "No se puede eliminar la cuota (FeePlan) porque existen pagos asociados en sus cuotas (installments)."
        ));
  }

  @Test
  void delete_returns500_withBody_whenUnexpectedException() throws Exception {
    // Simula error inesperado: el controller lo envuelve en ResponseStatusException(500)
    org.mockito.Mockito.doThrow(new RuntimeException("boom"))
        .when(feeService).deleteFeePlan(321L, "org_TENANT");

    mvc.perform(delete("/api/v1/finanzas/fees/{tenantId}/{feePlanId}", "org_TENANT", 321L))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.status").value(500))
        .andExpect(jsonPath("$.error").value("INTERNAL_SERVER_ERROR"))
        .andExpect(jsonPath("$.message").value("boom"));
  }
}
