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




    // ==================== Tests para list_members_with_details ====================

    @Test
    void testListMembersWithDetails_shouldReturnOkWithMembers() {
        // Given: Preparar datos de prueba
        MemberWithSubgroupAndSectionDto memberDto1 = createMemberWithSubgroupAndSectionDto(
                1L, "Juan", "Pérez", "12345", "Manada Akela", "Lobatos"
        );
        MemberWithSubgroupAndSectionDto memberDto2 = createMemberWithSubgroupAndSectionDto(
                2L, "María", "González", "67890", "Tropa Halcones", "Scouts"
        );
        
        List<MemberWithSubgroupAndSectionDto> expectedMembers = List.of(memberDto1, memberDto2);
        
        // When: El servicio retorna lista de miembros
        when(memberService.get_members_with_subgroup_and_section()).thenReturn(expectedMembers);

        // Then: Ejecutar y verificar
        ResponseEntity<List<MemberWithSubgroupAndSectionDto>> response = 
                memberController.listMembersWithDetails();

        assertEquals(OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Juan", response.getBody().get(0).getFirstName());
        assertEquals("María", response.getBody().get(1).getFirstName());
        
        verify(memberService, times(1)).get_members_with_subgroup_and_section();
    }

    @Test
    void testListMembersWithDetails_shouldReturnEmptyList() {
        // Given: El servicio retorna lista vacía
        when(memberService.get_members_with_subgroup_and_section()).thenReturn(Collections.emptyList());

        // When: Ejecutar endpoint
        ResponseEntity<List<MemberWithSubgroupAndSectionDto>> response = 
                memberController.listMembersWithDetails();

        // Then: Debe retornar 200 OK con lista vacía
        assertEquals(OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        
        verify(memberService, times(1)).get_members_with_subgroup_and_section();
    }

    @Test
    void testListMembersWithDetails_shouldReturnUnauthorizedWhenNoOrgId() {
        // Given: El servicio lanza IllegalStateException (no se pudo obtener org_id)
        when(memberService.get_members_with_subgroup_and_section())
                .thenThrow(new IllegalStateException("No se pudo determinar la organización del usuario autenticado"));

        // When: Ejecutar endpoint
        ResponseEntity<List<MemberWithSubgroupAndSectionDto>> response = 
                memberController.listMembersWithDetails();

        // Then: Debe retornar 401 UNAUTHORIZED
        assertEquals(UNAUTHORIZED, response.getStatusCode());
        assertNull(response.getBody());
        
        verify(memberService, times(1)).get_members_with_subgroup_and_section();
    }

    @Test
    void testListMembersWithDetails_shouldReturnInternalServerErrorOnUnexpectedException() {
        // Given: El servicio lanza una excepción inesperada
        when(memberService.get_members_with_subgroup_and_section())
                .thenThrow(new RuntimeException("Error de base de datos"));

        // When: Ejecutar endpoint
        ResponseEntity<List<MemberWithSubgroupAndSectionDto>> response = 
                memberController.listMembersWithDetails();

        // Then: Debe retornar 500 INTERNAL_SERVER_ERROR
        assertEquals(INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNull(response.getBody());
        
        verify(memberService, times(1)).get_members_with_subgroup_and_section();
    }

    @Test
    void testListMembersWithDetails_shouldReturnMembersWithCompleteSubgroupAndSectionInfo() {
        // Given: Preparar un miembro con información completa de subgrupo y sección
        MemberWithSubgroupAndSectionDto memberDto = createDetailedMemberDto();
        
        when(memberService.get_members_with_subgroup_and_section()).thenReturn(List.of(memberDto));

        // When: Ejecutar endpoint
        ResponseEntity<List<MemberWithSubgroupAndSectionDto>> response = 
                memberController.listMembersWithDetails();

        // Then: Verificar que retorna toda la información correctamente
        assertEquals(OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        
        MemberWithSubgroupAndSectionDto result = response.getBody().get(0);
        assertEquals(1L, result.getMemberId());
        assertEquals("Juan", result.getFirstName());
        assertEquals("Pérez", result.getLastName());
        
        // Verificar información del subgrupo
        assertNotNull(result.getSubgroup());
        assertEquals(5L, result.getSubgroup().getSubgroupId());
        assertEquals("Manada Akela", result.getSubgroup().getName());
        
        // Verificar información de la sección
        assertNotNull(result.getSubgroup().getSection());
        assertEquals(2L, result.getSubgroup().getSection().getSectionId());
        assertEquals("Lobatos", result.getSubgroup().getSection().getName());
        
        verify(memberService, times(1)).get_members_with_subgroup_and_section();
    }

    // ==================== Métodos auxiliares para crear DTOs de prueba ====================

    private MemberWithSubgroupAndSectionDto createMemberWithSubgroupAndSectionDto(
            Long memberId, String firstName, String lastName, String identification,
            String subgroupName, String sectionName) {
        
        MemberWithSubgroupAndSectionDto dto = new MemberWithSubgroupAndSectionDto();
        dto.setMemberId(memberId);
        dto.setFirstName(firstName);
        dto.setLastName(lastName);
        dto.setIdentification(identification);
        dto.setTenantId("tenant-001");
        dto.setUserId("user-123");
        dto.setEmail(firstName.toLowerCase() + "@example.com");
        dto.setIsActive(true);
        dto.setStatus(Status.APPROVED);
        
        // Crear información de la sección (sin usar builder para evitar dependencias adicionales)
        MemberWithSubgroupAndSectionDto.SectionInfo sectionInfo = 
                new MemberWithSubgroupAndSectionDto.SectionInfo();
        sectionInfo.setSectionId(2L);
        sectionInfo.setTenantId("tenant-001");
        sectionInfo.setGroupId(1L);
        sectionInfo.setName(sectionName);
        sectionInfo.setDescription("Descripción de " + sectionName);
        
        // Crear información del subgrupo con la sección
        MemberWithSubgroupAndSectionDto.SubgroupInfo subgroupInfo = 
                new MemberWithSubgroupAndSectionDto.SubgroupInfo();
        subgroupInfo.setSubgroupId(5L);
        subgroupInfo.setTenantId("tenant-001");
        subgroupInfo.setGroupId(1L);
        subgroupInfo.setSectionId(2L);
        subgroupInfo.setName(subgroupName);
        subgroupInfo.setDescription("Descripción de " + subgroupName);
        subgroupInfo.setIsActive(true);
        subgroupInfo.setSection(sectionInfo);
        
        dto.setSubgroup(subgroupInfo);
        
        return dto;
    }

    private MemberWithSubgroupAndSectionDto createDetailedMemberDto() {
        MemberWithSubgroupAndSectionDto dto = new MemberWithSubgroupAndSectionDto();
        dto.setMemberId(1L);
        dto.setUserId("auth0|123456");
        dto.setTenantId("tenant-001");
        dto.setGuardianId(100);
        dto.setFirstName("Juan");
        dto.setLastName("Pérez");
        dto.setAge(10);
        dto.setRole("Lobato");
        dto.setIdentification("12345678");
        dto.setEmail("juan.perez@example.com");
        dto.setGender("M");
        dto.setAddress("Calle 123 #45-67");
        dto.setPhone("3001234567");
        dto.setWeight("35kg");
        dto.setHeight("140cm");
        dto.setHobbies("Fútbol, lectura");
        dto.setSports("Fútbol, natación");
        dto.setInstruments("Guitarra");
        dto.setIsActive(true);
        dto.setStatus(Status.APPROVED);
        
        // Crear información completa de la sección
        MemberWithSubgroupAndSectionDto.SectionInfo sectionInfo = 
                new MemberWithSubgroupAndSectionDto.SectionInfo();
        sectionInfo.setSectionId(2L);
        sectionInfo.setTenantId("tenant-001");
        sectionInfo.setGroupId(1L);
        sectionInfo.setName("Lobatos");
        sectionInfo.setDescription("Rama de niños de 7 a 11 años");
        
        // Crear información completa del subgrupo
        MemberWithSubgroupAndSectionDto.SubgroupInfo subgroupInfo = 
                new MemberWithSubgroupAndSectionDto.SubgroupInfo();
        subgroupInfo.setSubgroupId(5L);
        subgroupInfo.setTenantId("tenant-001");
        subgroupInfo.setGroupId(1L);
        subgroupInfo.setSectionId(2L);
        subgroupInfo.setName("Manada Akela");
        subgroupInfo.setDescription("Subgrupo de lobatos inspirado en el líder de la manada");
        subgroupInfo.setIsActive(true);
        subgroupInfo.setSection(sectionInfo);
        
        dto.setSubgroup(subgroupInfo);
        
        return dto;
    }

}
