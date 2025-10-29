package uao.edu.co.scouts_project.statistics.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import uao.edu.co.scouts_project.member.repository.IMemberRepository;
import uao.edu.co.scouts_project.statistics.dto.TotalMembersDTO;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MemberStatisticsServiceTest {

    @Mock
    private IMemberRepository memberRepository;

    @InjectMocks
    private MemberStatisticsService memberStatisticsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    
    @Test
    void getTotalMembers_shouldReturnTotal() {
        when(memberRepository.count()).thenReturn(42L);

        TotalMembersDTO dto = memberStatisticsService.getTotalMembers();

        assertNotNull(dto);
        assertEquals(42L, dto.totalMembersCount());
        verify(memberRepository, times(1)).count();
    }

    @Test
    void getTotalMembers_shouldReturnZeroWhenNoMembers() {
        when(memberRepository.count()).thenReturn(0L);

        TotalMembersDTO result = memberStatisticsService.getTotalMembers();

        assertNotNull(result);
        assertEquals(0L, result.totalMembersCount());
    }

    @Test
    void getTotalMembers_shouldHandleDatabaseError() {
        when(memberRepository.count()).thenThrow(new RuntimeException("DB Error"));

        assertThrows(RuntimeException.class, () -> memberStatisticsService.getTotalMembers());
    }

    @Test
    void getTotalMembers_shouldNotReturnNegativeCount() {
        when(memberRepository.count()).thenReturn(-1L);

        TotalMembersDTO result = memberStatisticsService.getTotalMembers();

        assertNotNull(result);
        assertEquals(0L, result.totalMembersCount());
    }

    @Test
    void getTotalMembers_shouldHandleLargeNumbers() {
        when(memberRepository.count()).thenReturn(Long.MAX_VALUE);

        TotalMembersDTO result = memberStatisticsService.getTotalMembers();

        assertNotNull(result);
        assertEquals(Long.MAX_VALUE, result.totalMembersCount());
    }
}
