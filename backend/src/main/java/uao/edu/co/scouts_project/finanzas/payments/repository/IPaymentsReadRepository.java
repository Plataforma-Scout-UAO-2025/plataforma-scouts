package uao.edu.co.scouts_project.finanzas.payments.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import uao.edu.co.scouts_project.finanzas.payments.model.Installment;
import uao.edu.co.scouts_project.finanzas.payments.repository.projection.InstallmentWithConceptRow;
import uao.edu.co.scouts_project.finanzas.payments.repository.projection.MemberWithGroupsRow;

public interface IPaymentsReadRepository extends JpaRepository<Installment, Long> {

  // Miembros SCOUT del tenant con >= 1 installment
  @Query(
    value = """
            SELECT m.member_id,
                   m.first_name,
                   m.last_name,
                   m.age,
                   m.subgroup_id,
                   sg.name AS subgroup_name,
                   sg.section_id AS section_id,
                   sec.name     AS section_name
            FROM member m
            JOIN account a
              ON a.tenant_id = m.tenant_id AND a.member_id = m.member_id
            JOIN installment i
              ON i.tenant_id = m.tenant_id AND i.account_id = a.account_id
            LEFT JOIN subgroup sg
              ON sg.tenant_id = m.tenant_id AND sg.subgroup_id = m.subgroup_id
            LEFT JOIN section sec
              ON sec.tenant_id = sg.tenant_id AND sec.section_id = sg.section_id
            WHERE m.tenant_id = :tenantId
              AND m.role = 'SCOUT'
            GROUP BY m.member_id, m.first_name, m.last_name, m.age,
                     m.subgroup_id, sg.name, sg.section_id, sec.name
            ORDER BY m.last_name, m.first_name
            """,
    nativeQuery = true
  )
  List<MemberWithGroupsRow> findScoutMembersWithInstallments(@Param("tenantId") String tenantId);

  // Installments por miembro + tenant, con concept name/desc
  @Query(
    value = """
            SELECT i.installment_id,
                   i.due_date,
                   i.amount,
                   i.status,
                   c.name        AS concept_name,
                   c.description AS concept_desc
            FROM installment i
            JOIN account a
              ON a.tenant_id = i.tenant_id AND a.account_id = i.account_id
            JOIN concept c
              ON c.tenant_id = i.tenant_id AND c.concept_id = i.concept_id
            WHERE i.tenant_id = :tenantId
              AND a.member_id = :memberId
            ORDER BY i.due_date DESC
            """,
    nativeQuery = true
  )
  List<InstallmentWithConceptRow> findInstallmentsByMember(
      @Param("tenantId") String tenantId,
      @Param("memberId") Long memberId
  );
}
