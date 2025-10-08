package uao.edu.co.scouts_project.member.service;
import uao.edu.co.scouts_project.member.model.SchoolData;

import java.util.List;
import java.util.Optional;

public interface ISchoolService {

    SchoolData create_school(SchoolData school);

    List<SchoolData> find_by_identification(Integer member_id);

    Optional<SchoolData> update_school_by_id(Long id, SchoolData miembroUpdateDto);

}
