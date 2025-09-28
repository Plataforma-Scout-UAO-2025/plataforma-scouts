package uao.edu.co.scouts_project.Member.Mapper;
import uao.edu.co.scouts_project.Member.Dto.MemberUpdateDto;
import uao.edu.co.scouts_project.Member.Model.MemberModel;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MemberUpdateMapper {

    MemberUpdateDto toDto(MemberModel member);

    MemberModel toEntity(MemberUpdateDto dto);


}