package uao.edu.co.scouts_project.Member.Mapper;


import org.mapstruct.Mapper;
import uao.edu.co.scouts_project.Member.Dto.MemberDto;
import uao.edu.co.scouts_project.Member.Model.MemberModel;

@Mapper(componentModel = "spring")
public interface MemberMapper {

    MemberDto toDto(MemberModel member);

    MemberModel toEntity(MemberDto dto);


}
