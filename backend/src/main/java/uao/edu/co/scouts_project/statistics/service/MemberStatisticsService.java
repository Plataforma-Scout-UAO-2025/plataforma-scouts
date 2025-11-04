package uao.edu.co.scouts_project.statistics.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uao.edu.co.scouts_project.member.repository.IMemberRepository;
import uao.edu.co.scouts_project.statistics.dto.TotalMembersDTO;

@Service
public class MemberStatisticsService {

    private final IMemberRepository memberRepository;

    public MemberStatisticsService(IMemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public TotalMembersDTO getTotalMembers() {
        long total = memberRepository.count();
        // Aseguramos que nunca retornamos un número negativo
        return new TotalMembersDTO(Math.max(0L, total));
    }
}
