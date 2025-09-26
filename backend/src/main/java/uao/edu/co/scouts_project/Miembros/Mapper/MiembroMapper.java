package uao.edu.co.scouts_project.Miembros.Mapper;


import org.mapstruct.Mapper;
import uao.edu.co.scouts_project.Miembros.Dto.MiembroDto;
import uao.edu.co.scouts_project.Miembros.Model.MiembroModel;

@Mapper(componentModel = "spring")
public interface MiembroMapper {

    MiembroDto toDto(MiembroModel member);

    MiembroModel toEntity(MiembroDto dto);


}
