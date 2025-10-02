package uao.edu.co.scouts_project.member.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SchoolDataDTO {
    private Integer schoolDataId;
    private Integer identification;
    private String institution;
    private String course;
    private String calendar;
    private String shift;
}