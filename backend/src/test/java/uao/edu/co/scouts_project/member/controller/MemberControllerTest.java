package uao.edu.co.scouts_project.member.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import uao.edu.co.scouts_project.member.dto.*;
import uao.edu.co.scouts_project.member.mapper.MemberMapper;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.model.SchoolData;
import uao.edu.co.scouts_project.member.service.IMemberService;
import uao.edu.co.scouts_project.member.service.ISchoolService;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;
import uao.edu.co.scouts_project.organigrama.service.SubgroupService;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.http.HttpStatus.*;

class MemberControllerTest {

    @Mock
    private IMemberService memberService;

    @Mock
    private ISchoolService schoolService;

    @Mock
    private SubgroupService subgroupService;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private MemberController memberController;

    private Member member;

    private MemberDto memberDto;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Simular usuario autenticado
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testUser");
        SecurityContextHolder.setContext(securityContext);

        member = new Member();
        member.setMemberId(1L);
        member.setIdentification("12345");
        member.setTenantId("tenant-001");

        memberDto = MemberMapper.toDto(member);
    }

    @Test
    void testCreateMember_shouldReturnCreated() {
        when(memberService.create_member(any(Member.class))).thenReturn(member);

        ResponseEntity<?> response = memberController.create_member(memberDto);

        assertEquals(CREATED, response.getStatusCode());
        assertTrue(response.getBody() instanceof MemberDto);
        verify(memberService, times(1)).create_member(any(Member.class));
    }

    @Test
    void testListMembers_shouldReturnList() {
        when(memberService.get_members()).thenReturn(List.of(member));

        ResponseEntity<?> response = memberController.list_members();

        assertEquals(OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        verify(memberService, times(1)).get_members();
    }


    @Test
    void testListMemberById_shouldReturnOk() {
        when(memberService.get_member_by_id(1L)).thenReturn(Optional.of(member));

        ResponseEntity<?> response = memberController.list_member_by_id(1L);

        assertEquals(OK, response.getStatusCode());
        verify(memberService, times(1)).get_member_by_id(1L);
    }

    @Test
    void testListMemberById_shouldReturnNotFound() {
        when(memberService.get_member_by_id(1L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = memberController.list_member_by_id(1L);

        assertEquals(NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testUpdateMemberStatus_shouldReturnOk() {
        when(memberService.update_status(1L, Status.APPROVED)).thenReturn(true);

        ResponseEntity<?> response = memberController.update_member_status(1L, "APPROVED");

        assertEquals(OK, response.getStatusCode());
        verify(memberService).update_status(1L, Status.APPROVED);
    }


    @Test
    void testAssignSubgroup_shouldReturnOk() {
        AssignSubgroupDto dto = new AssignSubgroupDto(1L, 2L);
        when(memberService.assign_subGroup(1L, 2L)).thenReturn(true);

        ResponseEntity<?> response = memberController.assignSubgroup(dto);

        assertEquals(OK, response.getStatusCode());
        verify(memberService).assign_subGroup(1L, 2L);
    }

    @Test
    void testAssignSubgroup_shouldReturnBadRequest() {
        AssignSubgroupDto dto = new AssignSubgroupDto(1L, 2L);
        when(memberService.assign_subGroup(1L, 2L)).thenReturn(false);

        ResponseEntity<?> response = memberController.assignSubgroup(dto);

        assertEquals(BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testListSubGroupByMemberId_shouldReturnOk() {
        Subgroup subgroup = new Subgroup();
        subgroup.setSubgroupId(10L);
        when(subgroupService.getSubgroupByMemberId(1L)).thenReturn(Optional.of(subgroup));

        ResponseEntity<?> response = memberController.list_subGroup_by_memberId(1L);

        assertEquals(OK, response.getStatusCode());
        verify(subgroupService).getSubgroupByMemberId(1L);
    }

    @Test
    void testListSubGroupByMemberId_shouldReturnNotFound() {
        when(subgroupService.getSubgroupByMemberId(1L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = memberController.list_subGroup_by_memberId(1L);

        assertEquals(NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testCreateMemberWithSchool_shouldReturnCreated() {
        CreateMemberWithSchoolDto request = new CreateMemberWithSchoolDto();

        MemberDto memberDto = new MemberDto();
        memberDto.setIdentification("12345");
        request.setMember(memberDto);

        SchoolDataDto schoolDto = new SchoolDataDto();
        schoolDto.setInstitution("Colegio ABC");
        request.setSchool(schoolDto);

        Member member = new Member();
        member.setMemberId(1L);
        member.setIdentification("12345");
        member.setTenantId("tenant-001");

        SchoolData schoolData = new SchoolData();
        schoolData.setSchoolDataId(5L);
        schoolData.setMemberId(1L);

        when(memberService.create_member(any(Member.class))).thenReturn(member);
        when(schoolService.create_school(any(SchoolData.class))).thenReturn(schoolData);

        ResponseEntity<?> response = memberController.create_member_with_school(request);

        assertEquals(CREATED, response.getStatusCode());
        assertTrue(((Map<?, ?>) response.getBody()).containsKey("member"));
        verify(memberService).create_member(any(Member.class));
        verify(schoolService).create_school(any(SchoolData.class));
    }


    @Test
    void testListMembersByStatus_shouldReturnOk() {
        when(memberService.get_members_by_status("APPROVED"))
                .thenReturn(List.of(member));

        ResponseEntity<?> response = memberController.list_members_by_status("APPROVED");

        assertEquals(OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        verify(memberService).get_members_by_status("APPROVED");
    }


    @Test
    void testUpdateMemberById_shouldReturnOk() {
        Member updatedMember = new Member();
        updatedMember.setMemberId(1L);
        updatedMember.setIdentification("99999");

        when(memberService.update_member_by_id(eq(1L), any(Member.class)))
                .thenReturn(updatedMember);

        ResponseEntity<?> response = memberController.update_member_by_id(1L, memberDto);

        assertEquals(OK, response.getStatusCode());
        verify(memberService).update_member_by_id(eq(1L), any(Member.class));
    }

    @Test
    void testUpdateMemberById_shouldReturnNotFound() {
        when(memberService.update_member_by_id(eq(1L), any(Member.class)))
                .thenReturn(null);

        ResponseEntity<?> response = memberController.update_member_by_id(1L, memberDto);

        assertEquals(NOT_FOUND, response.getStatusCode());
    }

}
