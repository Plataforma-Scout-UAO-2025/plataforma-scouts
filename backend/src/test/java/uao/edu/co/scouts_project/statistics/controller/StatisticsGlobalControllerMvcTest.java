package uao.edu.co.scouts_project.statistics.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import uao.edu.co.scouts_project.statistics.dto.TotalMembersDTO;
import uao.edu.co.scouts_project.statistics.service.MemberStatisticsService;
import uao.edu.co.scouts_project.statistics.service.GroupStatisticsService;
import uao.edu.co.scouts_project.common.tenant.TenantFilter;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StatisticsGlobalController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class StatisticsGlobalControllerMvcTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockitoBean
    MemberStatisticsService memberStatisticsService;
    
    @MockitoBean
    GroupStatisticsService groupStatisticsService;

    @MockitoBean
    TenantFilter tenantFilter;

    @Test
    void getTotalMembers_shouldReturnJsonProperty_total_members_count() throws Exception {
        when(memberStatisticsService.getTotalMembers()).thenReturn(new TotalMembersDTO(123L));

        mvc.perform(get("/api/v1/statistics/members/total").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.total_members_count").value(123));
    }

    @Test
    void getTotalMembers_shouldReturn500OnException() throws Exception {
        when(memberStatisticsService.getTotalMembers()).thenThrow(new RuntimeException("boom"));

        mvc.perform(get("/api/v1/statistics/members/total").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isInternalServerError())
           .andExpect(jsonPath("$.message").exists());
    }
}
