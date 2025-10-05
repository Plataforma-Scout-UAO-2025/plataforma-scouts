package uao.edu.co.scouts_project.member.Mapper;

import uao.edu.co.scouts_project.member.Dto.MemberWithSchoolDto;
import uao.edu.co.scouts_project.member.Model.MemberModel;
import uao.edu.co.scouts_project.member.Model.SchoolModel;
import uao.edu.co.scouts_project.member.Model.SubgroupModel;

import java.sql.Timestamp;
import java.util.ArrayList;

public class MemberWithSchoolMapper {

    /**
     * Convierte un MemberWithSchoolDto a MemberModel (solo datos del miembro)
     * Los datos escolares deben manejarse por separado
     */
    public static MemberModel toEntity(MemberWithSchoolDto dto) {
        if (dto == null) {
            return null;
        }

        MemberModel member = new MemberModel();

        // Convertir subgroup_id a SubgroupModel
        if (dto.getSubgroup_id() != null) {
            SubgroupModel subgroup = new SubgroupModel();
            subgroup.setSubgroup_id(dto.getSubgroup_id());
            member.setSubgroup(subgroup);
        }

        member.setFirst_name(dto.getFirst_name());
        member.setLast_name(dto.getLast_name());
        member.setAge(dto.getAge());
        member.setRole(dto.getRole());
        member.setIdentification(dto.getIdentification());
        member.setDocument_type(dto.getDocument_type());
        member.setEmail(dto.getEmail());
        member.setGender(dto.getGender());

        // Convertir Date a Timestamp
        if (dto.getBirthDate() != null) {
            member.setBirth_date(new Timestamp(dto.getBirthDate().getTime()));
        }

        member.setAddress(dto.getAddress());
        member.setPhone(dto.getPhone());
        member.setWeight(dto.getWeight());
        member.setHeight(dto.getHeight());
        member.setHobbies(dto.getHobbies());
        member.setSports(dto.getSports());
        member.setInstruments(dto.getInstruments());
        member.setStatus(dto.getStatus());
        member.setAcceptance_date(dto.getAcceptance_date());
        member.setIn_charge_of(dto.getIn_charge_of()); // ArrayList -> List conversión automática
        member.setEmergency_phone(dto.getEmergency_phone()); // Nota el nombre: emergencyPhone

        return member;
    }

    /**
     * Convierte un MemberModel a MemberWithSchoolDto
     * Debe combinarse con datos de SchoolModel si existen
     */
    public static MemberWithSchoolDto toDto(MemberModel member) {
        if (member == null) {
            return null;
        }

        MemberWithSchoolDto dto = new MemberWithSchoolDto();

        // Extraer solo el ID del subgroup
        if (member.getSubgroup() != null) {
            dto.setSubgroup_id(member.getSubgroup().getSubgroup_id());
        }

        dto.setFirst_name(member.getFirst_name());
        dto.setLast_name(member.getLast_name());
        dto.setAge(member.getAge());
        dto.setRole(member.getRole());
        dto.setIdentification(member.getIdentification());
        dto.setDocument_type(member.getDocument_type());
        dto.setEmail(member.getEmail());
        dto.setGender(member.getGender());

        // Convertir Timestamp a Date
        if (member.getBirth_date() != null) {
            dto.setBirthDate(new java.util.Date(member.getBirth_date().getTime()));
        }

        dto.setAddress(member.getAddress());
        dto.setPhone(member.getPhone());
        dto.setWeight(member.getWeight());
        dto.setHeight(member.getHeight());
        dto.setHobbies(member.getHobbies());
        dto.setSports(member.getSports());
        dto.setInstruments(member.getInstruments());
        dto.setStatus(member.getStatus());
        dto.setAcceptance_date(member.getAcceptance_date());

        // Convertir List a ArrayList
        if (member.getIn_charge_of() != null) {
            dto.setIn_charge_of(new ArrayList<>(member.getIn_charge_of()));
        }

        dto.setEmergency_phone(member.getEmergency_phone()); // emergencyPhone -> emergency_phone

        return dto;
    }

    /**
     * Combina un MemberModel con un SchoolModel en un solo DTO
     */
    public static MemberWithSchoolDto toDto(MemberModel member, SchoolModel school) {
        if (member == null) {
            return null;
        }

        MemberWithSchoolDto dto = toDto(member);

        // Agregar datos escolares si existen
        if (school != null) {
            dto.setInstitution(school.getInstitution());
            dto.setCourse(school.getCourse());
            dto.setCalendar(school.getCalendar());
            dto.setShift(school.getShift());
        }

        return dto;
    }

    /**
     * Extrae solo los datos escolares del DTO y crea un SchoolModel
     * El member debe setearse después
     */
    public static SchoolModel toSchoolEntity(MemberWithSchoolDto dto) {
        if (dto == null) {
            return null;
        }

        // Solo crear SchoolModel si hay al menos un dato escolar
        if (dto.getInstitution() == null &&
                dto.getCourse() == null &&
                dto.getCalendar() == null &&
                dto.getShift() == null) {
            return null;
        }

        SchoolModel school = new SchoolModel();
        school.setInstitution(dto.getInstitution());
        school.setCourse(dto.getCourse());
        school.setCalendar(dto.getCalendar());
        school.setShift(dto.getShift());

        return school;
    }
}