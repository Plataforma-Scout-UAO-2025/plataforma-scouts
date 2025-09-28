package uao.edu.co.scouts_project.Member.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uao.edu.co.scouts_project.Member.Model.Enums.Estado;
import uao.edu.co.scouts_project.Member.Model.MemberModel;

import java.util.List;
import java.util.Optional;

public interface IMemberRepository extends JpaRepository<MemberModel, Integer> {

    Optional<MemberModel> findById(Integer member_id);

    List<MemberModel> findByEstado(Estado estado);


}
