package uao.edu.co.scouts_project.member.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;

/**
 * DTO utilizado para representar una vista resumida de la información de los miembros.
 * <p>
 * Este objeto se emplea principalmente en operaciones de listado o consultas masivas,
 * mostrando los datos personales y de contacto más relevantes de cada miembro,
 * sin incluir detalles o relaciones complejas.
 * <p>
 * También contiene un sub-DTO {@link EmergencyContactDto} que representa los contactos de emergencia asociados.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListMemberDto {

    private Long member_id;
    private String user_id;
    private String tenant_id;
    private Integer guardian_id;
    private String first_name;
    private String last_name;
    private Integer age;
    private String role;
    private String identification;
    private DocumentType document_type;
    private String email;
    private String gender;
    private LocalDate birth_date;
    private String address;
    private String phone;
    private String weight;
    private String height;
    private String hobbies;
    private String sports;
    private String instruments;
    private Boolean is_active;
    private String relationship;
    private Status status;
    private LocalDate acceptance_date;
    private List<EmergencyContactDto> emergency_contacts;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmergencyContactDto {
        private String name;
        private String relationship;
        private String phone;
    }

    public String getFullName() {
        return first_name + " " + last_name;
    }
}