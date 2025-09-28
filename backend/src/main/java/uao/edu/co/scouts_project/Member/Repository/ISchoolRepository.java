package uao.edu.co.scouts_project.Member.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uao.edu.co.scouts_project.Member.Model.SchoolModel;

public interface ISchoolRepository extends JpaRepository<SchoolModel, Integer> {
}
