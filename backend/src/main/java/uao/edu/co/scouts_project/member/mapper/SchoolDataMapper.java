package uao.edu.co.scouts_project.member.mapper;

import uao.edu.co.scouts_project.member.model.SchoolData;
import uao.edu.co.scouts_project.member.dto.SchoolDataDto;

public class SchoolDataMapper {

    public static SchoolDataDto toDto(SchoolData model) {
        if (model == null) return null;

        return SchoolDataDto.builder()
                .schoolDataId(model.getSchoolDataId())
                .memberId(model.getMemberId())
                .tenantId(model.getTenantId())
                .institution(model.getInstitution())
                .course(model.getCourse())
                .calendar(model.getCalendar())
                .shift(model.getShift())
                .build();
    }

    public static SchoolData toEntity(SchoolDataDto dto, Long memberId, String tenantId) {
        if (dto == null) return null;

        return SchoolData.builder()
                .schoolDataId(dto.getSchoolDataId())
                .memberId(memberId)
                .tenantId(tenantId)
                .institution(dto.getInstitution())
                .course(dto.getCourse())
                .calendar(dto.getCalendar())
                .shift(dto.getShift())
                .build();
    }
}