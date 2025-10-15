package uao.edu.co.scouts_project.member;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.repository.IMemberRepository;
import uao.edu.co.scouts_project.member.service.MemberServiceImp;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;
import uao.edu.co.scouts_project.organigrama.repository.SubgroupRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para MemberServiceImp
 * Metodología: Arrange – Act – Assert
 */
public class TestMemberService {

    private IMemberRepository repository;
    private SubgroupRepository subgroupRepository;
    private MemberServiceImp service;

    @BeforeEach
    void setup() {

        repository = mock(IMemberRepository.class);
        subgroupRepository = mock(SubgroupRepository.class);
        service = new MemberServiceImp();
        ReflectionTestUtils.setField(service, "memberRepository", repository);
        ReflectionTestUtils.setField(service, "subgroupRepository", subgroupRepository);

        // Simular un usuario autenticado
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("user123");
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);
    }

    @Test
    @DisplayName("create_member: debe crear un nuevo miembro correctamente")
    void createMember_success() {
        
        Subgroup subgroup = new Subgroup();
        subgroup.setSubgroupId(1L);
        // Arrange
        Member newMember = new Member();
        newMember.setUserId("user123");
        newMember.setTenantId("Centinelas");
        newMember.setGuardianId(1);
        newMember.setFirstName("Carlos");
        newMember.setLastName("Gómez");
        newMember.setDocumentType(DocumentType.TI);
        newMember.setIdentification("12345");
        newMember.setEmail("ejemplo@gmail.com");
        newMember.setGender("M");
        newMember.setAge(15);
        newMember.setAddress("Calle 123 #45-67");
        newMember.setPhone("3001234567");
        newMember.setWeight("70.5");
        newMember.setHeight("1.75");
        newMember.setHobbies("Fútbol, lectura");
        newMember.setSports("Baloncesto");
        newMember.setInstruments("Guitarra");
        newMember.setIsActive(true);
        newMember.setRelationship("Hermano");
        newMember.setSubgroup(subgroup);
        newMember.setStatus(Status.PENDING);

        when(repository.findByIdentification("12345")).thenReturn(Optional.empty());
        when(repository.save(any(Member.class))).thenAnswer(i -> {
            Member m = i.getArgument(0);
            m.setMemberId(1L);
            return m;
        });

        // Act
        Member result = service.create_member(newMember);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getMemberId());
        assertEquals("Carlos", result.getFirstName());
        assertEquals("user123", result.getUserId());
        verify(repository, times(1)).save(any(Member.class));
    }

    @Test
    @DisplayName("create_member: no debe permitir duplicar identificación")
    void createMember_duplicateIdentification_throwsError() {
        // Arrange
        Member existing = new Member();
        existing.setIdentification("999");

        Member newMember = new Member();
        newMember.setFirstName("Juan");
        newMember.setLastName("Pérez");
        newMember.setIdentification("999");

        when(repository.findByIdentification("999")).thenReturn(Optional.of(existing));

        // Act & Assert
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.create_member(newMember));

        assertEquals("A member with identification 999 already exists", ex.getMessage());
        verify(repository, never()).save(any(Member.class));
    }

    @Test
    @DisplayName("list_members: debe retornar los miembros ordenados")
    void listMembers_success() {
        // Arrange
        Member m1 = new Member();
        m1.setFirstName("Carlos");
        m1.setLastName("Zapata");

        Member m2 = new Member();
        m2.setFirstName("Ana");
        m2.setLastName("Gómez");

        when(repository.findAll()).thenReturn(List.of(m1, m2));

        // Act
        List<Member> result = service.get_members();

        // Assert
        assertEquals(2, result.size());
        assertEquals("Gómez", result.get(0).getLastName()); // ordenado alfabéticamente
        verify(repository, times(1)).findAll();
    }

    @Test
    @DisplayName("get_member_by_id: debe retornar un Optional con el miembro encontrado")
    void getMemberById_found() {
        // Arrange
        Member m = new Member();
        m.setMemberId(10L);
        m.setFirstName("Pedro");
        when(repository.findById(10L)).thenReturn(Optional.of(m));

        // Act
        Optional<Member> result = service.get_member_by_id(10L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("Pedro", result.get().getFirstName());
        verify(repository, times(1)).findById(10L);
    }

    @Test
    @DisplayName("update_status: debe actualizar correctamente el estado a APPROVED")
    void updateStatus_success() {
        // Arrange
        Member m = new Member();
        m.setMemberId(5L);
        m.setStatus(Status.PENDING);
        when(repository.findById(5L)).thenReturn(Optional.of(m));
        when(repository.save(any(Member.class))).thenReturn(m);

        // Act
        Boolean result = service.update_status(5L, Status.APPROVED);

        // Assert
        assertTrue(result);
        assertEquals(Status.APPROVED, m.getStatus());
        assertNotNull(m.getAcceptanceDate());
        verify(repository, times(1)).save(m);
    }

    @Test
    @DisplayName("update_status: debe lanzar error si el ID no existe")
    void updateStatus_memberNotFound_throwsError() {
        // Arrange
        when(repository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.update_status(99L, Status.REJECTED));

        assertTrue(ex.getMessage().contains("Member not found"));
        verify(repository, never()).save(any(Member.class));
    }

    @Test
    @DisplayName("update_member_by_id: debe actualizar solo campos no nulos")
    void updateMemberById_success() {
        // Arrange
        Member existing = new Member();
        existing.setMemberId(7L);
        existing.setFirstName("Pedro");
        existing.setLastName("García");

        Member updated = new Member();
        updated.setFirstName("Juan");
        updated.setLastName("García");

        when(repository.findById(7L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Member.class))).thenReturn(existing);

        // Act
        Member result = service.update_member_by_id(7L, updated);

        // Assert
        assertEquals("Juan", result.getFirstName());
        assertEquals("García", result.getLastName());
        verify(repository, times(1)).save(existing);
    }

    @Test
    @DisplayName("list_members_by_status: debe retornar miembros filtrados por estado válido")
    void listMembersByStatus_success() {
        // Arrange
        Member m1 = new Member();
        m1.setStatus(Status.APPROVED);
        m1.setLastName("Álvarez");

        when(repository.findByStatus(Status.APPROVED)).thenReturn(List.of(m1));

        // Act
        List<Member> result = service.get_members_by_status("APPROVED"); // 👈 ahora se pasa String

        // Assert
        assertEquals(1, result.size());
        assertEquals(Status.APPROVED, result.get(0).getStatus());
        verify(repository, times(1)).findByStatus(Status.APPROVED);
    }


    @Test
    @DisplayName("list_members_by_status: debe lanzar error si el estado es nulo")
    void listMembersByStatus_nullStatus_throwsError() {
        // Act & Assert
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.get_members_by_status(null));

        assertEquals("Status cannot be null or blank", ex.getMessage());
        verify(repository, never()).findByStatus(any());
    }
}