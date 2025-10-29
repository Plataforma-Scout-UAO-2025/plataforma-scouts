package uao.edu.co.scouts_project.statistics.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import uao.edu.co.scouts_project.statistics.dto.GroupMembersCountDTO;
import uao.edu.co.scouts_project.statistics.dto.GroupMembersDTO;
import uao.edu.co.scouts_project.statistics.dto.GroupStatisticsDTO;
import uao.edu.co.scouts_project.statistics.dto.InactiveGroupStatisticsDTO;
import uao.edu.co.scouts_project.statistics.service.GroupStatisticsService;
import uao.edu.co.scouts_project.common.tenant.TenantFilter;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StatisticsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class StatisticsControllerMvcTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockitoBean
    GroupStatisticsService groupStatisticsService;

    @MockitoBean
    TenantFilter tenantFilter;

    @Test
    void getTopGroupsByMembers_shouldReturnJsonWithCustomNames() throws Exception {
        var dto = new GroupMembersCountDTO(1L, "G1", 5L);
        when(groupStatisticsService.getTopGroupsByMembers("t1", 5)).thenReturn(List.of(dto));

        mvc.perform(get("/api/v1/tenants/{tenantId}/statistics/groups/most-members", "t1")
                .header("X-Tenant-Id", "t1")
                .accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].group_id").value(1))
           .andExpect(jsonPath("$[0].group_name").value("G1"))
           .andExpect(jsonPath("$[0].members_count").value(5));
    }

    @Test
    void getGroupsStatistics_shouldReturnJsonProperty_active_groups_count() throws Exception {
        when(groupStatisticsService.getGroupStatistics("t1")).thenReturn(new GroupStatisticsDTO(3L));

        mvc.perform(get("/api/v1/tenants/{tenantId}/statistics/groups", "t1")
                .header("X-Tenant-Id", "t1")
                .accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.active_groups_count").value(3));
    }

    @Test
    void getMembersByGroup_shouldReturnCamelCaseFields() throws Exception {
        when(groupStatisticsService.getMembersByGroup("t1")).thenReturn(List.of(new GroupMembersDTO(1L, "G1", 2L)));

        mvc.perform(get("/api/v1/tenants/{tenantId}/statistics/groups/members-count", "t1")
                .header("X-Tenant-Id", "t1")
                .accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].groupId").value(1))
           .andExpect(jsonPath("$[0].groupName").value("G1"))
           .andExpect(jsonPath("$[0].memberCount").value(2));
    }

    @Test
    void getInactiveGroupStatistics_shouldReturnJsonProperty_inactive_groups_count() throws Exception {
        when(groupStatisticsService.getInactiveGroupStatistics("t1")).thenReturn(new InactiveGroupStatisticsDTO(7L));

        mvc.perform(get("/api/v1/tenants/{tenantId}/statistics/groups/inactive", "t1")
                .header("X-Tenant-Id", "t1")
                .accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.inactive_groups_count").value(7));
    }

    @Test
    void endpoints_shouldReturn401WhenMissingHeader() throws Exception {
        mvc.perform(get("/api/v1/tenants/{tenantId}/statistics/groups/most-members", "t1"))
           .andExpect(status().isUnauthorized())
           .andExpect(jsonPath("$.message").value("Missing X-Tenant-Id header"));
    }
}
