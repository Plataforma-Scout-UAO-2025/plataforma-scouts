package uao.edu.co.scouts_project.member.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateMemberWithSchoolDto {

    @NotNull(message = "Los datos del miembro son obligatorios")
    @Valid
    private MemberDto member;

    @NotNull(message = "Los datos escolares son obligatorios")
    @Valid
    private SchoolDataDto school;
}