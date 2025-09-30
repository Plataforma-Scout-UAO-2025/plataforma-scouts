package uao.edu.co.scouts_project.Member.Mapper;

import uao.edu.co.scouts_project.Member.Model.MemberModel;
import uao.edu.co.scouts_project.Member.Dto.MemberDto;
import uao.edu.co.scouts_project.Member.Model.SubgroupModel;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;

public class MemberMapper {

    public static MemberDto toDto(MemberModel model) {
        if (model == null) return null;
        MemberDto dto = new MemberDto();
        dto.setMember_id(model.getMember_id());
        dto.setSubgroup_id(model.getSubgroup() != null ? model.getSubgroup().getSubgroup_id() : null);
        dto.setFirst_name(model.getFirst_name());
        dto.setLast_name(model.getLast_name());
        dto.setAge(model.getAge());
        dto.setRole(model.getRole());
        dto.setIdentification(model.getIdentification());
        dto.setDocument_type(model.getDocument_type());
        dto.setEmail(model.getEmail());
        dto.setGender(model.getGender());
        dto.setBirthDate(model.getBirth_date() != null ? new Date(model.getBirth_date().getTime()) : null);
        dto.setAddress(model.getAddress());
        dto.setPhone(model.getPhone());
        dto.setHeight(model.getHeight());
        dto.setWeight(model.getWeight());
        dto.setHobbies(model.getHobbies());
        dto.setSports(model.getSports());
        dto.setInstruments(model.getInstruments());
        dto.setStatus(model.getStatus());
        dto.setAcceptance_date(model.getAcceptance_date() != null ? new Timestamp(model.getAcceptance_date().getTime()) : null);
        dto.setIn_charge_of(model.getIn_charge_of() != null ? new ArrayList<>(model.getIn_charge_of()) : null);
        dto.setEmergency_phone(model.getEmergencyPhone());
        return dto;
    }

    public static MemberModel toEntity(MemberDto dto) {
        if (dto == null) return null;

        MemberModel model = new MemberModel();
        model.setMember_id(dto.getMember_id());
        if (dto.getSubgroup_id() != null) {
            SubgroupModel subgroup = new SubgroupModel();
            subgroup.setSubgroup_id(dto.getSubgroup_id());
            model.setSubgroup(subgroup);
        }
        model.setFirst_name(dto.getFirst_name());
        model.setLast_name(dto.getLast_name());
        model.setAge(dto.getAge());
        model.setRole(dto.getRole());
        model.setIdentification(dto.getIdentification());
        model.setDocument_type(dto.getDocument_type());
        model.setEmail(dto.getEmail());
        model.setGender(dto.getGender());
        model.setBirth_date(dto.getBirthDate() != null ? new Timestamp(dto.getBirthDate().getTime()) : null);
        model.setAddress(dto.getAddress());
        model.setPhone(dto.getPhone());
        model.setWeight(dto.getWeight() != null ? String.valueOf(dto.getWeight()) : null);
        model.setHeight(dto.getHeight() != null ? String.valueOf(dto.getHeight()) : null);
        model.setHobbies(dto.getHobbies());
        model.setSports(dto.getSports());
        model.setInstruments(dto.getInstruments());
        model.setStatus(dto.getStatus());
        model.setAcceptance_date(dto.getAcceptance_date() != null ? new Timestamp(dto.getAcceptance_date().getTime()) : null);
        model.setIn_charge_of(dto.getIn_charge_of() != null ? new ArrayList<>(dto.getIn_charge_of()) : null);
        model.setEmergencyPhone(null);

        return model;
    }

}
