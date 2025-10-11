package uao.edu.co.scouts_project.member.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * DTO que agrupa la información necesaria para crear un nuevo miembro
 * junto con sus datos escolares asociados.
 * <p>
 * Este objeto se utiliza en operaciones donde se requiere registrar
 * simultáneamente la información personal y académica del miembro,
 * garantizando la consistencia entre ambas entidades.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateMemberWithSchoolDto {

    /**
     * Datos personales y administrativos del miembro.
     * No puede ser nulo y debe cumplir con las validaciones definidas en {@link MemberDto}.
     */
    @NotNull(message = "Los datos del miembro son obligatorios")
    @Valid
    private MemberDto member;

    /**
     * Información escolar asociada al miembro.
     * No puede ser nula y debe cumplir con las validaciones definidas en {@link SchoolDataDto}.
     */
    @NotNull(message = "Los datos escolares son obligatorios")
    @Valid
    private SchoolDataDto school;
}