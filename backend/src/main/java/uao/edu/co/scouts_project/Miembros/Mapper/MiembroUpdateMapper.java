package uao.edu.co.scouts_project.Miembros.Mapper;
import uao.edu.co.scouts_project.Miembros.Dto.MiembroUpdateDto;
import uao.edu.co.scouts_project.Miembros.Model.MiembroModel;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MiembroUpdateMapper {

    MiembroUpdateDto toDto(MiembroModel member);

    MiembroModel toEntity(MiembroUpdateDto dto);


}