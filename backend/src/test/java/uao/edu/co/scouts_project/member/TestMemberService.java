package uao.edu.co.scouts_project.member;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.repository.IMemberRepository;
    import uao.edu.co.scouts_project.member.service.MemberServiceImp;
import uao.edu.co.scouts_project.member.service.MemberServiceImp;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para MemberServiceImpl
 * Basadas en la metodología Arrange - Act - Assert
 */
public class TestMemberService {

    private IMemberRepository repository;
    private MemberServiceImp service;

    @BeforeEach
    void setup() {
        repository = mock(IMemberRepository.class);
        service = new MemberServiceImp(repository);
    }

    @Test
    @DisplayName("create_member: debe crear un nuevo miembro correctamente")
    void createMember_success() {
        // Arrange
        Member newMember = new Member();
        newMember.setMemberId(1L);
        newMember.setFirstName("Carlos");
        newMember.setLastName("Gómez");
        newMember.setStatus(Status.PENDING);

        when(repository.save(any(Member.class))).thenReturn(newMember);

        // Act
        Member result = service.create_member(newMember);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getMemberId());
        assertEquals("Carlos", result.getFirstName());
        verify(repository, times(1)).save(any(Member.class));
    }

    @Test
    @DisplayName("list_members: debe retornar todos los miembros")
    void listMembers_success() {
        // Arrange
        Member m1 = new Member();
        Member m2 = new Member();
        when(repository.findAll()).thenReturn(List.of(m1, m2));

        // Act
        List<Member> result = service.list_members();

        // Assert
        assertEquals(2, result.size());
        verify(repository, times(1)).findAll();
    }

    @Test
    @DisplayName("get_member_by_id: debe retornar el miembro cuando existe")
    void getMemberById_found() {
        // Arrange
        Member m = new Member();
        m.setMemberId(10L);
        when(repository.findById(10L)).thenReturn(Optional.of(m));

        // Act
        Optional<Member> result = service.get_member_by_id(10L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(10L, result.get().getMemberId());
        verify(repository, times(1)).findById(10L);
    }

    @Test
    @DisplayName("update_status: debe actualizar el estado del miembro")
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
        verify(repository, times(1)).save(m);
    }

    @Test
    @DisplayName("update_member_by_id: debe actualizar datos del miembro correctamente")
    void updateMemberById_success() {
        // Arrange
        Member existing = new Member();
        existing.setMemberId(7L);
        existing.setFirstName("Pedro");

        Member updatedData = new Member();
        updatedData.setFirstName("Juan");

        when(repository.findById(7L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Member.class))).thenReturn(existing);

        // Act
        Member result = service.update_member_by_id(7L, updatedData);

        // Assert
        assertNotNull(result);
        assertEquals("Juan", result.getFirstName());
        verify(repository, times(1)).save(existing);
    }

    @Test
    @DisplayName("list_members_by_status: debe retornar miembros filtrados por estado")
    void listMembersByStatus_success() {
        // Arrange
        Member m1 = new Member();
        m1.setStatus(Status.APPROVED);
        when(repository.findByStatus(Status.APPROVED)).thenReturn(List.of(m1));

        // Act
        List<Member> result = service.list_members_by_status(Status.APPROVED);

        // Assert
        assertEquals(1, result.size());
        assertEquals(Status.APPROVED, result.get(0).getStatus());
        verify(repository, times(1)).findByStatus(Status.APPROVED);
    }
}
