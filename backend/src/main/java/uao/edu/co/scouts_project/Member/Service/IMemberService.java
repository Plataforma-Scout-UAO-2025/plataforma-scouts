package uao.edu.co.scouts_project.Member.Service;

import uao.edu.co.scouts_project.Member.Model.MemberModel;

import java.util.List;
import java.util.Optional;

public interface IMemberService {

    MemberModel create_member(MemberModel member);

    List<MemberModel> list_members();

    Optional<MemberModel> get_member_by_id(Integer member_id);

    Boolean update_status(Integer member_id, String status);

    Boolean update_role(Integer member_id, String role);

    Optional<MemberModel> update_member_by_id(Integer member_id, MemberModel miembroUpdateDto);

    List<MemberModel> list_members_by_status(String status);


}


