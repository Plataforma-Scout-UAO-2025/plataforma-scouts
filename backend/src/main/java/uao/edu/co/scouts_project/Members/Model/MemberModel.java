package uao.edu.co.scouts_project.Members.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Solicitud")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberModel {

    @Id
    @NotBlank @Positive
    private Long identificacion;
    @NotNull
    private String nombres;
    @NotNull
    private String apellidos;
    @Email
    private String correo;
    private String tipo_documento;
    private String sexo;
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
