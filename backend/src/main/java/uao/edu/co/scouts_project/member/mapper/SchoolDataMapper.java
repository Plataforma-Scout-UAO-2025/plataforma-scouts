package uao.edu.co.scouts_project.member.mapper;

import uao.edu.co.scouts_project.member.model.SchoolData;
import uao.edu.co.scouts_project.member.dto.SchoolDataDto;

/**
 * Mapper encargado de convertir entre la entidad SchoolData y su DTO SchoolDataDto.
 * Facilita el intercambio de información entre las capas del sistema.
 */
public class SchoolDataMapper {

    private SchoolDataMapper() {
        throw new IllegalStateException("Utility class");
    }
    /**
     * Convierte una entidad SchoolData a un DTO SchoolDataDto.
     *
     * @param model Entidad SchoolData a convertir.
     * @return DTO con la información escolar del miembro.
     */
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

    /**
     * Convierte un DTO SchoolDataDto a una entidad SchoolData.
     *
     * @param dto DTO con los datos escolares a convertir.
     * @param memberId ID del miembro asociado.
     * @param tenantId ID del arrendatario asociado.
     * @return Entidad SchoolData lista para persistir.
     */
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