package uao.edu.co.scouts_project.finanzas.payments.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
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
  @Query(value = """
      SELECT i.installment_id,
            i.due_date,
            i.amount,
            i.status,
            c.name        AS concept_name,
            c.description AS concept_desc,
            p.payment_id,
            p.paid_at,
            p.method,
            p.reference,
            p.payer_member_id
      FROM installment i
      JOIN account a
        ON a.tenant_id = i.tenant_id AND a.account_id = i.account_id
      JOIN concept c
        ON c.tenant_id = i.tenant_id AND c.concept_id = i.concept_id
      /* Último elemento del array payments (por orden de inserción) */
      LEFT JOIN LATERAL (
        SELECT
          e->>'payment_id'                       AS payment_id,
          NULLIF(e->>'paid_at','')::date         AS paid_at,
          e->>'method'                           AS method,
          e->>'reference'                        AS reference,
          NULLIF(e->>'payer_member_id','')::bigint AS payer_member_id
        FROM jsonb_array_elements(COALESCE(i.payments, '[]'::jsonb)) WITH ORDINALITY AS t(e, ord)
        ORDER BY ord DESC
        LIMIT 1
      ) p ON TRUE
      WHERE i.tenant_id = :tenantId
        AND a.member_id = :memberId
      ORDER BY i.due_date DESC
      """, nativeQuery = true)
  List<InstallmentWithConceptRow> findInstallmentsByMember(
      @Param("tenantId") String tenantId,
      @Param("memberId") Long memberId
  );

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Transactional
  @Query(value = """
    UPDATE installment i
    SET payments = COALESCE(i.payments, '[]'::jsonb)
                || jsonb_build_array(
                      jsonb_build_object(
                        'payment_id',      CAST(:paymentId      AS text),
                        'amount',          CAST(:amount         AS numeric),
                        -- JSON no tiene tipo fecha; lo guardamos como string ISO yyyy-MM-dd
                        'paid_at',         to_char(CAST(:paidAt AS date), 'YYYY-MM-DD'),
                        'method',          CAST(:method         AS text),
                        'reference',       CAST(:reference      AS text),
                        'payer_member_id', CAST(:payerMemberId  AS bigint)
                      )
                    )
    WHERE i.tenant_id = :tenantId
      AND i.installment_id = :installmentId
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(COALESCE(i.payments, '[]'::jsonb)) e
        WHERE e->>'payment_id' = :paymentId
      )
    """, nativeQuery = true)
  int appendPayment(@Param("tenantId") String tenantId,
                    @Param("installmentId") Long installmentId,
                    @Param("paymentId") String paymentId,
                    @Param("amount") java.math.BigDecimal amount,
                    @Param("paidAt") java.time.LocalDate paidAt,
                    @Param("method") String method,
                    @Param("reference") String reference,
                    @Param("payerMemberId") Long payerMemberId);


}



