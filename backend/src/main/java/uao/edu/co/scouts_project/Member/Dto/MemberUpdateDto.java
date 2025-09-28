package uao.edu.co.scouts_project.Member.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberUpdateDto {
    private String tipoDecoumento;
    private String correo;
    private String ciudad;
    private String direccion;
    private String telefono;
    private String institucion;
    private String curso;
    private String calendarioEscolar;
    private String jornadaEscolar;
    private Double peso;
    private Double estatura;
    private String pasatiempos;
    private String deportes;
    private String instrumentos;
}
