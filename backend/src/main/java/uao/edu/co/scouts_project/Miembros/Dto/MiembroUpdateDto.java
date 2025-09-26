package uao.edu.co.scouts_project.Miembros.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.Miembros.Model.Enums.Estado;

import java.time.LocalDate;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class MiembroUpdateDto {
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
