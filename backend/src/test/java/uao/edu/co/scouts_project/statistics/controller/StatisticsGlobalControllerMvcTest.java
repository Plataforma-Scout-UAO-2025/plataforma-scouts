package uao.edu.co.scouts_project.statistics.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import uao.edu.co.scouts_project.statistics.dto.*;
import uao.edu.co.scouts_project.statistics.service.MemberStatisticsService;

import java.util.Arrays;
import java.util.Collections;
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
    void getTotalMembers_shouldReturnZeroWhenNoMembers() throws Exception {
        when(memberStatisticsService.getTotalMembers()).thenReturn(new TotalMembersDTO(0L));

        mvc.perform(get("/api/v1/statistics/members/total").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.total_members_count").value(0));
    }

    @Test
    void getTotalMembers_shouldReturn500OnException() throws Exception {
        when(memberStatisticsService.getTotalMembers()).thenThrow(new RuntimeException("boom"));

        mvc.perform(get("/api/v1/statistics/members/total").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isInternalServerError())
           .andExpect(jsonPath("$.message").value("Ha ocurrido un error interno en el servidor"));
    }

    @Test
    void getTotalMembers_shouldHandleLargeNumbers() throws Exception {
        when(memberStatisticsService.getTotalMembers()).thenReturn(new TotalMembersDTO(Long.MAX_VALUE));

        mvc.perform(get("/api/v1/statistics/members/total").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.total_members_count").value(Long.MAX_VALUE));
    }

    @Test
    void getTotalMembers_shouldReturnJsonContentType() throws Exception {
        when(memberStatisticsService.getTotalMembers()).thenReturn(new TotalMembersDTO(0L));

        mvc.perform(get("/api/v1/statistics/members/total"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$").isMap())
           .andExpect(jsonPath("$.total_members_count").exists());
    }

    @Test
    void getGroupStatistics_shouldReturnJsonWithCorrectStructure() throws Exception {
        GroupStatisticsDTO dto = new GroupStatisticsDTO(5L);
        when(groupStatisticsService.getGroupStatistics()).thenReturn(dto);

        mvc.perform(get("/api/v1/statistics/groups").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.active_groups_count").value(5));
    }

    @Test
    void getInactiveGroupStatistics_shouldReturnJsonWithCorrectStructure() throws Exception {
        InactiveGroupStatisticsDTO dto = new InactiveGroupStatisticsDTO(3L);
        when(groupStatisticsService.getInactiveGroupStatistics()).thenReturn(dto);

        mvc.perform(get("/api/v1/statistics/groups/inactive").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.inactive_groups_count").value(3));
    }

    @Test
    void getMembersByGroup_shouldReturnJsonWithCorrectStructure() throws Exception {
        GroupMembersDTO dto = new GroupMembersDTO(1L, "Test Group", 10L);
        when(groupStatisticsService.getMembersByGroup()).thenReturn(Arrays.asList(dto));

        mvc.perform(get("/api/v1/statistics/groups/members-count").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].group_id").value(1))
           .andExpect(jsonPath("$[0].group_name").value("Test Group"))
           .andExpect(jsonPath("$[0].member_count").value(10));
    }

    @Test
    void getMembersByGroup_shouldReturnEmptyArrayWhenNoData() throws Exception {
        when(groupStatisticsService.getMembersByGroup()).thenReturn(Collections.emptyList());

        mvc.perform(get("/api/v1/statistics/groups/members-count").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$").isArray())
           .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getTopGroupsByMembers_shouldReturnJsonWithCorrectStructure() throws Exception {
        GroupMembersCountDTO dto = new GroupMembersCountDTO(1L, "Test Group", 10L);
        when(groupStatisticsService.getTopGroupsByMembers(10)).thenReturn(Arrays.asList(dto));

        mvc.perform(get("/api/v1/statistics/groups/most-members").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$[0].group_id").value(1))
           .andExpect(jsonPath("$[0].group_name").value("Test Group"))
           .andExpect(jsonPath("$[0].members_count").value(10));
    }

    @Test
    void getTopGroupsByMembers_shouldReturnEmptyArrayWhenNoData() throws Exception {
        when(groupStatisticsService.getTopGroupsByMembers(10)).thenReturn(Collections.emptyList());

        mvc.perform(get("/api/v1/statistics/groups/most-members").accept(MediaType.APPLICATION_JSON))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$").isArray())
           .andExpect(jsonPath("$").isEmpty());
    }
}
