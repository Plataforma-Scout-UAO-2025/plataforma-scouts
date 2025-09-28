package uao.edu.co.scouts_project.Member.Service;

import jakarta.persistence.criteria.CriteriaBuilder;
import uao.edu.co.scouts_project.Member.Model.Enums.Estado;
import uao.edu.co.scouts_project.Member.Model.MemberModel;

import java.util.List;
import java.util.Optional;

public interface IMemberService {

    MemberModel create_member(MemberModel member);

    List<MemberModel> list_members();

    Optional<MemberModel> get_member_by_id(Integer member_id);

    Boolean update_status(Integer member_id, Estado estado);

    Optional<MemberModel> update_member_by_id(Integer member_id, MemberModel miembroUpdateDto);

    List<MemberModel> list_members_by_status(Estado estado);


}


