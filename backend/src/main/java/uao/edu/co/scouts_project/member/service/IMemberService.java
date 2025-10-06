package uao.edu.co.scouts_project.member.service;

import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.util.List;
import java.util.Optional;

public interface IMemberService {

    Member create_member(Member member);

    List<Member> list_members();

    Optional<Member> get_member_by_id(Long member_id);

    Boolean update_status(Long memberId, Status status);

    Member update_member_by_id(Long memberId, Member member);

    List<Member> list_members_by_status(Status status);
}
