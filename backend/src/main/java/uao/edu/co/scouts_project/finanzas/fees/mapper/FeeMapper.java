package uao.edu.co.scouts_project.finanzas.fees.mapper;

import org.springframework.stereotype.Component;

import uao.edu.co.scouts_project.finanzas.fees.dto.CuotaDto;
import uao.edu.co.scouts_project.finanzas.fees.dto.MemberPaymentDto;
import uao.edu.co.scouts_project.finanzas.fees.model.FeePlan;
import uao.edu.co.scouts_project.finanzas.fees.model.read.MemberView;
import uao.edu.co.scouts_project.finanzas.fees.repository.projection.MemberHierarchyRow;

/**
 * Mappers entre entidades de dominio y DTOs de finanzas/fees.
 */
@Component
public class FeeMapper {

    /**
     * Mapea una entidad de solo lectura MemberView -> MemberPaymentDto.
     * MemberView NO trae nombres de subgroup/section, así que van como null.
     */
    public MemberPaymentDto toMemberDto(MemberView v) {
        if (v == null) return null;
        return new MemberPaymentDto(
            v.getUserId(),     // user_id
            v.getFirstName(),    // first_name
            v.getLastName(),     // last_name
            v.getSubgroup(),     // subgroup_id
            null,                // subgroup_name (no disponible en MemberView)
            null,                // section_id   (no disponible en MemberView)
            null,                // section_name (no disponible en MemberView)
            v.getAge()           // age
        );
    }

    /**
     * Projection con jerarquía completa (recomendado para listados).
     * MemberHierarchyRow SÍ trae subgroup_name y section_*.
     */
    public MemberPaymentDto toMemberDto(MemberHierarchyRow r) {
        if (r == null) return null;
        return new MemberPaymentDto(
            r.getUserId(),
            r.getFirstName(),
            r.getLastName(),
            r.getSubgroupId(),
            r.getSubgroupName(),
            r.getSectionId(),
            r.getSectionName(),
            r.getAge()
        );
    }

    /**
     * Construye un CuotaDto a partir del FeePlan y un MemberPaymentDto (puede ser null).
     */
    public CuotaDto toCuotaDto(FeePlan fp, MemberPaymentDto memberOrNull) {
        if (fp == null) return null;

        // fp.getPeriodicity() y fp.getScope() son String en la entidad
        String periodicity = fp.getPeriodicity();
        String scope       = fp.getScope();

        return new CuotaDto(
            fp.getFeePlanId(),
            fp.getAmount(),
            fp.getConcept() != null ? fp.getConcept().getName() : null,
            fp.getConcept() != null ? fp.getConcept().getDescription() : null,
            periodicity,
            scope,
            fp.getStartDate(),
            fp.getEndDate(),
            fp.getAssociatedTo() // puede ser null si scope != SCOUT o no hay targetMember
        );
    }

    /**
     * Overload conveniente: recibe un MemberView (de JPA) y lo convierte internamente.
     */
    public CuotaDto toCuotaDto(FeePlan fp, MemberView memberViewOrNull) {
        return toCuotaDto(fp, toMemberDto(memberViewOrNull));
    }

    /**
     * Overload sin miembro: útil cuando no corresponde enviar miembro.
     */
    public CuotaDto toCuotaDto(FeePlan fp) {
        return toCuotaDto(fp, (MemberPaymentDto) null);
    }
}
