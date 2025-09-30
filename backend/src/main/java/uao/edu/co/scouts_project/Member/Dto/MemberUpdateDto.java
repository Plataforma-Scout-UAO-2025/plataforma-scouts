package uao.edu.co.scouts_project.Member.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@AllArgsConstructor
@NoArgsConstructor

@Data
public class MemberUpdateDto {
    private String email;
    private String phone;
    private String address;
}

