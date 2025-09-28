package uao.edu.co.scouts_project.Member.Service;
import uao.edu.co.scouts_project.Member.Model.SchoolModel;

import java.util.List;
import java.util.Optional;

public interface ISchoolService {

    SchoolModel create_school(SchoolModel school);

    List<SchoolModel> list_schools();

    Optional<SchoolModel> update_school_by_id(Long id, SchoolModel miembroUpdateDto);

}
