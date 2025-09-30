package uao.edu.co.scouts_project.Member.Repository;

import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import uao.edu.co.scouts_project.Member.Model.MemberModel;

import java.util.List;
import java.util.Optional;

public interface IMemberRepository extends JpaRepository<MemberModel, Integer> {

    Optional<MemberModel> findByIdentification(@NotNull Integer identification);

    List<MemberModel> findByStatus(String status);


}
