package uao.edu.co.scouts_project.Miembros.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import uao.edu.co.scouts_project.Miembros.Model.Enums.Estado;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "Miembro")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MiembroModel {

    @Id
    @Positive
    private Integer id_miembro;
    @Positive
    @NotNull
    private Long Identificacion;
    @NotNull
    private String tipoDocumento;
    @NotNull
    private String nombres;
    @NotNull
    private String apellidos;
    @Email
    private String correo;
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
    @Enumerated(EnumType.STRING)
    private Estado estado;
    private LocalDate fechaAceptacion;
}

