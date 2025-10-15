package uao.edu.co.scouts_project.finanzas.fees.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

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
    om.registerModule(new JavaTimeModule());                  // Soporte java.time.*
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
}
