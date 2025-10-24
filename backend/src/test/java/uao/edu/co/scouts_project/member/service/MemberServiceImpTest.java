package uao.edu.co.scouts_project.member.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.repository.IMemberRepository;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import uao.edu.co.scouts_project.organigrama.repository.SubgroupRepository;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MemberServiceImpTest {

    @InjectMocks
    private MemberServiceImp memberService;

    @Mock
    private IMemberRepository memberRepository;

    @Mock
    private SubgroupRepository subgroupRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testCreateMember_shouldCreateSuccessfully() {
        Member member = new Member();
        member.setFirstName("Juan");
        member.setLastName("Pérez");
        member.setIdentification("123");

        when(authentication.getName()).thenReturn("adminUser");
        when(memberRepository.findByIdentification("123")).thenReturn(Optional.empty());
        when(memberRepository.save(any(Member.class))).thenAnswer(i -> {
            Member m = i.getArgument(0);
            m.setMemberId(1L);
            return m;
        });

        Member result = memberService.create_member(member);

        assertNotNull(result);
        assertEquals("adminUser", result.getUserId());
        assertEquals(Status.PENDING, result.getStatus());
        verify(memberRepository).save(any(Member.class));
    }

    @Test
    void testCreateMember_shouldThrowWhenDuplicate() {
        Member member = new Member();
        member.setFirstName("Ana");
        member.setLastName("López");
        member.setIdentification("999");

        when(memberRepository.findByIdentification("999")).thenReturn(Optional.of(member));

        assertThrows(IllegalArgumentException.class, () -> memberService.create_member(member));
    }

    @Test
    void testGetMembers_shouldReturnSortedList() {
        Member m1 = new Member(); m1.setFirstName("Ana"); m1.setLastName("Zapata");
        Member m2 = new Member(); m2.setFirstName("Carlos"); m2.setLastName("Alvarez");

        when(memberRepository.findAll()).thenReturn(List.of(m1, m2));

        List<Member> result = memberService.get_members();

        assertEquals(2, result.size());
        assertEquals("Alvarez", result.get(0).getLastName());
    }

    @Test
    void testGetMemberById_shouldReturnOptional() {
        Member m = new Member();
        m.setMemberId(1L);
        when(memberRepository.findById(1L)).thenReturn(Optional.of(m));

        Optional<Member> result = memberService.get_member_by_id(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getMemberId());
    }

    @Test
    void testGetMembersByStatus_shouldFilterAndSort() {
        Member m1 = new Member(); m1.setFirstName("Ana"); m1.setLastName("López");
        when(memberRepository.findByStatus(Status.APPROVED)).thenReturn(List.of(m1));

        List<Member> result = memberService.get_members_by_status("approved");

        assertEquals(1, result.size());
        verify(memberRepository).findByStatus(Status.APPROVED);
    }

    @Test
    void testUpdateStatus_shouldUpdateSuccessfully() {
        Member m = new Member();
        m.setMemberId(1L);
        m.setStatus(Status.PENDING);

        when(memberRepository.findById(1L)).thenReturn(Optional.of(m));

        boolean result = memberService.update_status(1L, Status.APPROVED);

        assertTrue(result);
        assertEquals(Status.APPROVED, m.getStatus());
        assertEquals(LocalDate.now(), m.getAcceptanceDate());
        verify(memberRepository).save(m);
    }


    @Test
    void testUpdateMemberById_shouldCopyNonNullProperties() {
        Member existing = new Member();
        existing.setMemberId(1L);
        existing.setFirstName("Old");
        existing.setLastName("Data");

        Member update = new Member();
        update.setFirstName("New");

        when(memberRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(memberRepository.save(any(Member.class))).thenAnswer(i -> i.getArgument(0));

        Member result = memberService.update_member_by_id(1L, update);

        assertEquals("New", result.getFirstName());
        assertEquals("Data", result.getLastName());
    }
}