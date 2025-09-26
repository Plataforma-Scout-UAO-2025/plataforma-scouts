package uao.edu.co.scouts_project.Miembros.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.Miembros.Model.Enums.Estado;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MiembroDto {

    private Long identificacion;
    private String nombres;
    private String apellidos;
    private String correo;
    private String tipoDocumento;
    private String sexo;
    private String fechaNacimiento;
    private String ciudad;
    private String direccion;
    private Long telefono;
    private String institucion;
    private String curso;
    private String calendarioEscolar;
    private String jornadaEscolar;
    private Double peso;
    private Double estatura;
    private String tipoSangre;
    private String pasatiempos;
    private String deportes;
    private String instrumentos;
    private Boolean estaRegistrado;
    private Estado estado;
    private LocalDate fechaAceptacion;

}
