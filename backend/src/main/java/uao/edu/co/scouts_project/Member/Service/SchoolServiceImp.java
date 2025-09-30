package uao.edu.co.scouts_project.Member.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.Member.Model.SchoolModel;
import uao.edu.co.scouts_project.Member.Repository.ISchoolRepository;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchoolServiceImp implements ISchoolService {

    private final ISchoolRepository schoolRepository;

    @Override
    public SchoolModel create_school(SchoolModel school) {
        log.info("Creating new school for member_id={}",
                school.getMember() != null ? school.getMember().getMember_id() : null);
        return schoolRepository.save(school);
    }

    @Override
    public List<SchoolModel> find_by_identification(Integer member_id) {
        log.info("Listing schools for memberId={}", member_id);
        return schoolRepository.findByMemberId(member_id);
    }

    @Override
    public Optional<SchoolModel> update_school_by_id(Long id, SchoolModel schoolUpdate) {
        log.info("Updating school with id={}", id);
        return schoolRepository.findById(id.intValue())
                .map(existing -> {
                    existing.setInstitution(schoolUpdate.getInstitution());
                    existing.setCourse(schoolUpdate.getCourse());
                    existing.setCalendar(schoolUpdate.getCalendar());
                    existing.setShift(schoolUpdate.getShift());
                    return schoolRepository.save(existing);
                });
    }
}
