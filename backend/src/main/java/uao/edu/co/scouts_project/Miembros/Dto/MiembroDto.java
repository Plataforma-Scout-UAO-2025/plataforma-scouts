package uao.edu.co.scouts_project.Miembros.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.Miembros.Model.Enums.TIpoDocumento;
import uao.edu.co.scouts_project.Miembros.Model.Enums.Sexo;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MiembroDto {

    private Long identificacion;
    private String nombres;
    private String apellidos;
    private String correo;
    private TIpoDocumento tipo_documento;
    private Sexo sexo;
    private String fecha_nacimiento;
    private String ciudad;
    private String direccion;
    private Long telefono;
    private String institucion;
    private String curso;
    private String calendario;
    private String jornada;
    private Double peso;
    private Double estatura;
    private String tipo_sangre;
    private String rh;
    private String pasa_tiempos;
    private String deportes;
    private String instrumentos;
}
