package uao.edu.co.scouts_project.Members.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uao.edu.co.scouts_project.Members.Model.MemberModel;

public interface IMemberRepository extends JpaRepository<MemberModel, Long> {
}
