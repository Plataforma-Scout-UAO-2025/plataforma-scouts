package uao.edu.co.scouts_project.guardian;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import uao.edu.co.scouts_project.guardian.controller.GuardianController;
import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.AvailableGuardianDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianCreateResponse;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWithMembersDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.GuardianNotFoundException;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.MemberAlreadyAssignedException;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.MemberNotFoundException;
import uao.edu.co.scouts_project.guardian.service.GuardianService;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GuardianController.class)
@DisplayName("Guardian Controller Tests")
class GuardianControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private GuardianService guardianService;

    private GuardianCreateDTO guardianDTO;
    private GuardianWithMembersDTO guardianWithMembersDTO;
    private MemberDTO memberDTO;
    private AvailableGuardianDTO availableGuardianDTO;

    @BeforeEach
    void setUp() {
        guardianDTO = GuardianCreateDTO.builder()
                .userId("guardian-123")
                .tenantId("tenant-1")
                .firstName("Carlos")
                .lastName("Rodríguez")
                .age(38)
                .identification("1087654321")
                .documentType(DocumentType.CC)
                .phone("3012345678")
                .isActive(true)
                .relationship("Padre")
                .status(Status.APPROVED)
                .acceptanceDate(LocalDate.now())
                .rol("ACUDIENTE")
                .build();

        memberDTO = MemberDTO.builder()
                .memberId(1L)
                .firstName("María")
                .lastName("González")
                .age(12)
                .identification("1098765432")
                .documentType(DocumentType.TI)
                .phone("3109876543")
                .build();

        guardianWithMembersDTO = GuardianWithMembersDTO.builder()
                .userId("guardian-123")
                .firstName("Carlos")
                .lastName("Rodríguez")
                .members(Arrays.asList(memberDTO))
                .build();

        availableGuardianDTO = AvailableGuardianDTO.builder()
                .memberId(1L)
                .firstName("Carlos")
                .lastName("Rodríguez")
                .identification("1087654321")
                .build();
    }

    @Nested
    @DisplayName("GET /api/v1/guardian/{id}")
    class GetGuardianByIdTests {

        @Test
        @DisplayName("Should return 200 and guardian when found")
        void shouldReturnGuardianWhenFound() throws Exception {
            when(guardianService.findGuardianById(1L)).thenReturn(guardianDTO);

            mockMvc.perform(get("/api/v1/guardian/1"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.userId").value("guardian-123"))
                    .andExpect(jsonPath("$.firstName").value("Carlos"))
                    .andExpect(jsonPath("$.lastName").value("Rodríguez"))
                    .andExpect(jsonPath("$.identification").value("1087654321"));

            verify(guardianService, times(1)).findGuardianById(1L);
        }

        @Test
        @DisplayName("Should return 404 when guardian not found")
        void shouldReturn404WhenGuardianNotFound() throws Exception {
            when(guardianService.findGuardianById(999L))
                    .thenThrow(new GuardianNotFoundException("Guardian not found"));

            mockMvc.perform(get("/api/v1/guardian/999"))
                    .andExpect(status().isNotFound());

            verify(guardianService, times(1)).findGuardianById(999L);
        }
    }

    @Nested
    @DisplayName("GET /api/v1/guardian/list-available")
    class GetAvailableGuardiansTests {

        @Test
        @DisplayName("Should return 200 and list of available guardians")
        void shouldReturnAvailableGuardians() throws Exception {
            List<AvailableGuardianDTO> guardians = Arrays.asList(availableGuardianDTO);
            when(guardianService.findAvailableGuardians()).thenReturn(guardians);

            mockMvc.perform(get("/api/v1/guardian/list-available"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].memberId").value(1))
                    .andExpect(jsonPath("$[0].firstName").value("Carlos"));

            verify(guardianService, times(1)).findAvailableGuardians();
        }

        @Test
        @DisplayName("Should return empty list when no available guardians")
        void shouldReturnEmptyListWhenNoGuardians() throws Exception {
            when(guardianService.findAvailableGuardians()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/v1/guardian/list-available"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(0)));

            verify(guardianService, times(1)).findAvailableGuardians();
        }
    }

    @Nested
    @DisplayName("GET /api/v1/guardian/{id}/members")
    class GetGuardianWithMembersTests {

        @Test
        @DisplayName("Should return 200 and guardian with members")
        void shouldReturnGuardianWithMembers() throws Exception {
            when(guardianService.findGuardianWithMembers(1L)).thenReturn(guardianWithMembersDTO);

            mockMvc.perform(get("/api/v1/guardian/1/members"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.userId").value("guardian-123"))
                    .andExpect(jsonPath("$.firstName").value("Carlos"))
                    .andExpect(jsonPath("$.members", hasSize(1)))
                    .andExpect(jsonPath("$.members[0].firstName").value("María"));

            verify(guardianService, times(1)).findGuardianWithMembers(1L);
        }

        @Test
        @DisplayName("Should return 404 when guardian not found")
        void shouldReturn404WhenGuardianNotFound() throws Exception {
            when(guardianService.findGuardianWithMembers(999L))
                    .thenThrow(new MemberNotFoundException("Guardian not found"));

            mockMvc.perform(get("/api/v1/guardian/999/members"))
                    .andExpect(status().isNotFound());

            verify(guardianService, times(1)).findGuardianWithMembers(999L);
        }
    }

    @Nested
    @DisplayName("GET /api/v1/guardian/{guardianId}/members-list")
    class GetMembersInChargeOfTests {

        @Test
        @DisplayName("Should return 200 and list of members")
        void shouldReturnMembersList() throws Exception {
            List<MemberDTO> members = Arrays.asList(memberDTO);
            when(guardianService.findMembersInChargeOf(1L)).thenReturn(members);

            mockMvc.perform(get("/api/v1/guardian/1/members-list"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].firstName").value("María"));

            verify(guardianService, times(1)).findMembersInChargeOf(1L);
        }

        @Test
        @DisplayName("Should return empty list when no members")
        void shouldReturnEmptyListWhenNoMembers() throws Exception {
            when(guardianService.findMembersInChargeOf(1L)).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/v1/guardian/1/members-list"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));

            verify(guardianService, times(1)).findMembersInChargeOf(1L);
        }
    }

    @Nested
    @DisplayName("POST /api/v1/guardian")
    class CreateGuardianTests {

        @Test
        @DisplayName("Should return 201 and create guardian successfully")
        void shouldCreateGuardianSuccessfully() throws Exception {
            GuardianCreateResponse response = new GuardianCreateResponse(1L);
            when(guardianService.saveGuardian(any(GuardianCreateDTO.class))).thenReturn(response);

            mockMvc.perform(post("/api/v1/guardian")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(guardianDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.member_id").value(1));

            verify(guardianService, times(1)).saveGuardian(any(GuardianCreateDTO.class));
        }

        @Test
        @DisplayName("Should return 400 when validation fails")
        void shouldReturn400WhenValidationFails() throws Exception {
            GuardianCreateDTO invalidDTO = GuardianCreateDTO.builder().build();

            mockMvc.perform(post("/api/v1/guardian")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidDTO)))
                    .andExpect(status().isBadRequest());

            verify(guardianService, never()).saveGuardian(any());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/guardian/{id}")
    class UpdateGuardianTests {

        @Test
        @DisplayName("Should return 200 when guardian updated successfully")
        void shouldUpdateGuardianSuccessfully() throws Exception {
            doNothing().when(guardianService).updateGuardianById(anyLong(), any(GuardianCreateDTO.class));

            mockMvc.perform(put("/api/v1/guardian/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(guardianDTO)))
                    .andExpect(status().isOk());

            verify(guardianService, times(1)).updateGuardianById(eq(1L), any(GuardianCreateDTO.class));
        }

        @Test
        @DisplayName("Should return 404 when guardian not found")
        void shouldReturn404WhenGuardianNotFound() throws Exception {
            doThrow(new GuardianNotFoundException("Guardian not found"))
                    .when(guardianService).updateGuardianById(anyLong(), any(GuardianCreateDTO.class));

            mockMvc.perform(put("/api/v1/guardian/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(guardianDTO)))
                    .andExpect(status().isNotFound());

            verify(guardianService, times(1)).updateGuardianById(eq(999L), any(GuardianCreateDTO.class));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/guardian/members/available-guardian")
    class GetAvailableMembersForGuardianTests {

        @Test
        @DisplayName("Should return 200 and list of members without guardian")
        void shouldReturnMembersWithoutGuardian() throws Exception {
            List<MemberDTO> members = Arrays.asList(memberDTO);
            when(guardianService.findMembersWithoutGuardian()).thenReturn(members);

            mockMvc.perform(get("/api/v1/guardian/members/available-guardian"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].firstName").value("María"));

            verify(guardianService, times(1)).findMembersWithoutGuardian();
        }
    }

    @Nested
    @DisplayName("POST /api/v1/guardian/{guardianId}/members/{memberId}")
    class AddMemberToGuardianTests {

        @Test
        @DisplayName("Should return 200 when member added successfully")
        void shouldAddMemberSuccessfully() throws Exception {
            doNothing().when(guardianService).addMemberToGuardian(1L, 2L);

            mockMvc.perform(post("/api/v1/guardian/1/members/2"))
                    .andExpect(status().isOk());

            verify(guardianService, times(1)).addMemberToGuardian(1L, 2L);
        }

        @Test
        @DisplayName("Should return 404 when guardian not found")
        void shouldReturn404WhenGuardianNotFound() throws Exception {
            doThrow(new GuardianNotFoundException("Guardian not found"))
                    .when(guardianService).addMemberToGuardian(999L, 2L);

            mockMvc.perform(post("/api/v1/guardian/999/members/2"))
                    .andExpect(status().isNotFound());

            verify(guardianService, times(1)).addMemberToGuardian(999L, 2L);
        }

        @Test
        @DisplayName("Should return 409 when member already assigned")
        void shouldReturn409WhenMemberAlreadyAssigned() throws Exception {
            doThrow(new MemberAlreadyAssignedException("Member already assigned"))
                    .when(guardianService).addMemberToGuardian(1L, 2L);

            mockMvc.perform(post("/api/v1/guardian/1/members/2"))
                    .andExpect(status().isConflict());

            verify(guardianService, times(1)).addMemberToGuardian(1L, 2L);
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/guardian/{guardianId}/members/{memberId}")
    class RemoveMemberFromGuardianTests {

        @Test
        @DisplayName("Should return 204 when member removed successfully")
        void shouldRemoveMemberSuccessfully() throws Exception {
            doNothing().when(guardianService).removeGuardianIdFromMember(1L, 2L);

            mockMvc.perform(delete("/api/v1/guardian/1/members/2"))
                    .andExpect(status().isNoContent());

            verify(guardianService, times(1)).removeGuardianIdFromMember(1L, 2L);
        }

        @Test
        @DisplayName("Should return 404 when member not found")
        void shouldReturn404WhenMemberNotFound() throws Exception {
            doThrow(new MemberNotFoundException("Member not found"))
                    .when(guardianService).removeGuardianIdFromMember(1L, 999L);

            mockMvc.perform(delete("/api/v1/guardian/1/members/999"))
                    .andExpect(status().isNotFound());

            verify(guardianService, times(1)).removeGuardianIdFromMember(1L, 999L);
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/guardian/{currentGuardianId}/members/{memberId}/reassign/{newGuardianId}")
    class ReassignMemberGuardianTests {

        @Test
        @DisplayName("Should return 200 when member reassigned successfully")
        void shouldReassignMemberSuccessfully() throws Exception {
            when(guardianService.reassignMemberGuardian(2L, 1L, 3L)).thenReturn(true);

            mockMvc.perform(put("/api/v1/guardian/1/members/2/reassign/3"))
                    .andExpect(status().isOk());

            verify(guardianService, times(1)).reassignMemberGuardian(2L, 1L, 3L);
        }

        @Test
        @DisplayName("Should return 404 when guardian not found")
        void shouldReturn404WhenGuardianNotFound() throws Exception {
            doThrow(new GuardianNotFoundException("Guardian not found"))
                    .when(guardianService).reassignMemberGuardian(2L, 999L, 3L);

            mockMvc.perform(put("/api/v1/guardian/999/members/2/reassign/3"))
                    .andExpect(status().isNotFound());

            verify(guardianService, times(1)).reassignMemberGuardian(2L, 999L, 3L);
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/guardian/{id}")
    class DeleteGuardianTests {

        @Test
        @DisplayName("Should return 204 when guardian deleted successfully")
        void shouldDeleteGuardianSuccessfully() throws Exception {
            doNothing().when(guardianService).deleteGuardianById(1L);

            mockMvc.perform(delete("/api/v1/guardian/1"))
                    .andExpect(status().isNoContent());

            verify(guardianService, times(1)).deleteGuardianById(1L);
        }

        @Test
        @DisplayName("Should return 404 when guardian not found")
        void shouldReturn404WhenGuardianNotFound() throws Exception {
            doThrow(new GuardianNotFoundException("Guardian not found"))
                    .when(guardianService).deleteGuardianById(999L);

            mockMvc.perform(delete("/api/v1/guardian/999"))
                    .andExpect(status().isNotFound());

            verify(guardianService, times(1)).deleteGuardianById(999L);
        }
    }
}
