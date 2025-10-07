package uao.edu.co.scouts_project.finanzas.fees.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import uao.edu.co.scouts_project.finanzas.fees.data.TestData;
import uao.edu.co.scouts_project.finanzas.fees.dto.CuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.IdNameDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.MemberPaymentDto;
import uao.edu.co.scouts_project.finanzas.fees.service.IFeeService;

@WebMvcTest(controllers = FeesController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class FeesControllerTest {

  @Autowired MockMvc mvc;
  @Autowired ObjectMapper om;

  @MockitoBean
  IFeeService feeService;

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
    // IFeeService.listFeesByTenant retorna List<CuotaDto>
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

  // --- Opcionales si ya expusiste estos endpoints en el controlador ---

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
