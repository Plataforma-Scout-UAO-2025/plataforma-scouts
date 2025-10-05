package uao.edu.co.scouts_project.member.Mapper;

import uao.edu.co.scouts_project.member.Model.SchoolModel;
import uao.edu.co.scouts_project.member.Model.MemberModel;
import uao.edu.co.scouts_project.member.Dto.SchoolDto;

public class SchoolMapper {

    public static SchoolDto toDto(SchoolModel model) {
        if (model == null) return null;

        SchoolDto dto = new SchoolDto();
        dto.setSchoolDataId(model.getSchool_data_id());
        dto.setIdentification(model.getMember() != null ? model.getMember().getIdentification() : null);
        dto.setInstitution(model.getInstitution());
        dto.setCourse(model.getCourse());
        dto.setCalendar(model.getCalendar());
        dto.setShift(model.getShift());

        return dto;
    }

    public static SchoolModel toEntity(SchoolDto dto, MemberModel member) {
        if (dto == null) return null;

        SchoolModel model = new SchoolModel();
        model.setSchool_data_id(dto.getSchoolDataId());
        model.setMember(member); // ya deberías cargar el MemberModel desde BD
        model.setInstitution(dto.getInstitution());
        model.setCourse(dto.getCourse());
        model.setCalendar(dto.getCalendar());
        model.setShift(dto.getShift());

        return model;
    }
}
