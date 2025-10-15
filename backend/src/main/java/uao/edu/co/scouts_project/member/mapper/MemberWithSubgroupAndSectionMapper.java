package uao.edu.co.scouts_project.member.mapper;

import org.springframework.stereotype.Component;
import uao.edu.co.scouts_project.member.dto.MemberWithSubgroupAndSectionDto;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.organigrama.model.Section;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mapper para convertir entre la entidad Member y el DTO MemberWithSubgroupAndSectionDto.
 * Incluye la información completa del subgrupo y la sección.
 */
@Component
public class MemberWithSubgroupAndSectionMapper {

    /**
     * Convierte un Member a MemberWithSubgroupAndSectionDto.
     * 
     * @param member El miembro a convertir
     * @param section La sección asociada al subgrupo del miembro
     * @return DTO con la información completa
     */
    public MemberWithSubgroupAndSectionDto toDto(Member member, Section section) {
        if (member == null) {
            return null;
        }

        Subgroup subgroup = member.getSubgroup();
        
        MemberWithSubgroupAndSectionDto.SectionInfo sectionInfo = null;
        if (section != null) {
            sectionInfo = MemberWithSubgroupAndSectionDto.SectionInfo.builder()
                    .sectionId(section.getSectionId())
                    .tenantId(section.getTenantId())
                    .groupId(section.getGroupId())
                    .name(section.getName())
                    .description(section.getDescription())
                    .iconObjectId(section.getIconObjectId())
                    .photoPrincipal(section.getPhotoPrincipal())
                    .galleryObjectIds(section.getGalleryObjectIds())
                    .createdAt(section.getCreatedAt())
                    .updatedAt(section.getUpdatedAt())
                    .build();
        }

        MemberWithSubgroupAndSectionDto.SubgroupInfo subgroupInfo = null;
        if (subgroup != null) {
            subgroupInfo = MemberWithSubgroupAndSectionDto.SubgroupInfo.builder()
                    .subgroupId(subgroup.getSubgroupId())
                    .tenantId(subgroup.getTenantId())
                    .groupId(subgroup.getGroupId())
                    .sectionId(subgroup.getSectionId())
                    .name(subgroup.getName())
                    .description(subgroup.getDescription())
                    .photoPrincipal(subgroup.getPhotoPrincipal())
                    .isActive(subgroup.getIsActive())
                    .createdAt(subgroup.getCreatedAt())
                    .updatedAt(subgroup.getUpdatedAt())
                    .section(sectionInfo)
                    .build();
        }

        return MemberWithSubgroupAndSectionDto.builder()
                .memberId(member.getMemberId())
                .userId(member.getUserId())
                .tenantId(member.getTenantId())
                .guardianId(member.getGuardianId())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .age(member.getAge())
                .role(member.getRole())
                .identification(member.getIdentification())
                .documentType(member.getDocumentType())
                .email(member.getEmail())
                .gender(member.getGender())
                .birthDate(member.getBirthDate())
                .address(member.getAddress())
                .phone(member.getPhone())
                .weight(member.getWeight())
                .height(member.getHeight())
                .hobbies(member.getHobbies())
                .sports(member.getSports())
                .instruments(member.getInstruments())
                .isActive(member.getIsActive())
                .status(member.getStatus())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .subgroup(subgroupInfo)
                .build();
    }

    /**
     * Convierte una lista de Members a una lista de DTOs.
     * 
     * @param members Lista de miembros
     * @param sectionsMap Mapa de sectionId a Section para evitar N+1 queries
     * @return Lista de DTOs
     */
    public List<MemberWithSubgroupAndSectionDto> toDtoList(List<Member> members, Map<Long, Section> sectionsMap) {
        if (members == null) {
            return null;
        }

        return members.stream()
                .map(member -> {
                    Section section = null;
                    if (member.getSubgroup() != null && member.getSubgroup().getSectionId() != null) {
                        section = sectionsMap.get(member.getSubgroup().getSectionId());
                    }
                    return toDto(member, section);
                })
                .collect(Collectors.toList());
    }
}
