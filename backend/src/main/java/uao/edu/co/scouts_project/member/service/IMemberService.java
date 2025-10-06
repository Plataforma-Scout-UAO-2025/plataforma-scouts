package uao.edu.co.scouts_project.member.service;

import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.List;
import java.util.Optional;

public interface IMemberService {

    Member create_member(Member member);

    List<Member> list_members();

    Optional<Member> get_member_by_id(Long member_id);

    List<Member> list_members_by_status(String status);

    Boolean update_status(Long memberId, Status enumStatus);

    Member update_member_by_id(Long memberId, Member memberUpdate);

}
