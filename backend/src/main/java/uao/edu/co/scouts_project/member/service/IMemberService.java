package uao.edu.co.scouts_project.member.service;

import uao.edu.co.scouts_project.member.model.Member;

import java.util.List;
import java.util.Optional;

public interface IMemberService {

    Member create_member(Member member);

    List<Member> list_members();

    Optional<Member> get_member_by_id(Long member_id);

    Boolean update_status(Integer member_id, String status);

    Optional<Member> update_member_by_id(Integer member_id, Member miembroUpdateDto);

    List<Member> list_members_by_status(String status);


}


