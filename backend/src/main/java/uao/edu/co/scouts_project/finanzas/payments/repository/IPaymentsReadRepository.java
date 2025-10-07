package uao.edu.co.scouts_project.finanzas.payments.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import uao.edu.co.scouts_project.finanzas.payments.model.Installment;
import uao.edu.co.scouts_project.finanzas.payments.repository.projection.InstallmentWithConceptAndMemberRow;
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
                        'paid_at',         to_char(CAST(:paidAt AS date), 'YYYY-MM-DD'),
                        'method',          CAST(:method         AS text),
                        'reference',       CAST(:reference      AS text),
                        'payer_member_id', CAST(:payerMemberId  AS bigint)
                      )
                    ),
        status   = 'PAID'
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


  @Query(value = """
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
            AND EXISTS(
              SELECT 1
              FROM guardian_member gm
              WHERE gm.tenant_id = m.tenant_id
                AND gm.member_id = m.member_id
                AND gm.guardian_id = :guardianId
            )
          GROUP BY m.member_id, m.first_name, m.last_name, m.age,
                  m.subgroup_id, sg.name, sg.section_id, sec.name
          ORDER BY m.last_name, m.first_name
          """,
          nativeQuery = true)
  java.util.List<uao.edu.co.scouts_project.finanzas.payments.repository.projection.MemberWithGroupsRow>
  findScoutMembersWithInstallmentsByGuardian(@org.springframework.data.repository.query.Param("tenantId") String tenantId,
                                            @org.springframework.data.repository.query.Param("guardianId") Long guardianId);




  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Transactional
  @Query(value = """
      UPDATE installment i
      SET status = 'OVERDUE'
      WHERE i.tenant_id = :tenantId
        AND i.status = 'PENDING'
        AND i.due_date < CURRENT_DATE
      """, nativeQuery = true)
  int markOverdueForTenant(@Param("tenantId") String tenantId);

  // ---- TODAS LAS CUOTAS DEL TENANT (SCOUT, con último pago y datos de miembro) ----
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
            p.payer_member_id,
            m.member_id,
            m.first_name,
            m.last_name,
            m.subgroup_id,
            sg.name       AS subgroup_name,
            sg.section_id AS section_id,
            sec.name      AS section_name
      FROM installment i
      JOIN account a
        ON a.tenant_id = i.tenant_id AND a.account_id = i.account_id
      JOIN member m
        ON m.tenant_id = a.tenant_id AND m.member_id = a.member_id
      JOIN concept c
        ON c.tenant_id = i.tenant_id AND c.concept_id = i.concept_id
      LEFT JOIN subgroup sg
        ON sg.tenant_id = m.tenant_id AND sg.subgroup_id = m.subgroup_id
      LEFT JOIN section sec
        ON sec.tenant_id = sg.tenant_id AND sec.section_id = sg.section_id
      LEFT JOIN LATERAL (
        SELECT
          e->>'payment_id'                        AS payment_id,
          NULLIF(e->>'paid_at','')::date         AS paid_at,
          e->>'method'                            AS method,
          e->>'reference'                         AS reference,
          NULLIF(e->>'payer_member_id','')::bigint AS payer_member_id
        FROM jsonb_array_elements(COALESCE(i.payments, '[]'::jsonb)) WITH ORDINALITY AS t(e, ord)
        ORDER BY ord DESC
        LIMIT 1
      ) p ON TRUE
      WHERE i.tenant_id = :tenantId
        AND m.role = 'SCOUT'
      ORDER BY m.last_name, m.first_name, i.due_date DESC
      """, nativeQuery = true)
  java.util.List<InstallmentWithConceptAndMemberRow>
  findAllInstallmentsForTenant(@Param("tenantId") String tenantId);

  // ---- TODAS LAS CUOTAS DEL TENANT FILTRADAS POR ACUDIENTE ----
  // Ajusta guardian_member si tu relación se llama distinto
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
           p.payer_member_id,
           m.member_id,
           m.first_name,
           m.last_name,
           m.subgroup_id,
           sg.name       AS subgroup_name,
           sg.section_id AS section_id,
           sec.name      AS section_name
    FROM installment i
    JOIN account a
      ON a.tenant_id = i.tenant_id AND a.account_id = i.account_id
    JOIN member m
      ON m.tenant_id = a.tenant_id AND m.member_id = a.member_id
    JOIN concept c
      ON c.tenant_id = i.tenant_id AND c.concept_id = i.concept_id
    LEFT JOIN subgroup sg
      ON sg.tenant_id = m.tenant_id AND sg.subgroup_id = m.subgroup_id
    LEFT JOIN section sec
      ON sec.tenant_id = sg.tenant_id AND sec.section_id = sg.section_id
    LEFT JOIN LATERAL (
      SELECT
        e->>'payment_id'                          AS payment_id,
        NULLIF(e->>'paid_at','')::date           AS paid_at,
        e->>'method'                              AS method,
        e->>'reference'                           AS reference,
        NULLIF(e->>'payer_member_id','')::bigint  AS payer_member_id
      FROM jsonb_array_elements(COALESCE(i.payments, '[]'::jsonb)) WITH ORDINALITY AS t(e, ord)
      ORDER BY ord DESC
      LIMIT 1
    ) p ON TRUE
    WHERE i.tenant_id = :tenantId
      AND m.role = 'SCOUT'
      AND m.guardian_id = :guardianId   -- <--- usa tu columna real
    ORDER BY m.last_name, m.first_name, i.due_date DESC
    """, nativeQuery = true)
List<InstallmentWithConceptAndMemberRow>
findAllInstallmentsForGuardian(@Param("tenantId") String tenantId,
                               @Param("guardianId") Long guardianId);


  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @org.springframework.transaction.annotation.Transactional
  @org.springframework.data.jpa.repository.Query(value = """
    UPDATE installment i
    SET status = 'PAID'
    WHERE i.tenant_id = :tenantId
      AND jsonb_array_length(COALESCE(i.payments,'[]'::jsonb)) > 0
      AND i.status <> 'PAID'
  """, nativeQuery = true)
  int markPaidWhereHasPayments(@org.springframework.data.repository.query.Param("tenantId") String tenantId);

  @org.springframework.data.jpa.repository.Query(
  value = """
    SELECT EXISTS(
      SELECT 1
      FROM member m
      WHERE m.tenant_id = :tenantId
        AND m.member_id = :memberId
    )
  """,
  nativeQuery = true
)
boolean memberExistsInTenant(
    @org.springframework.data.repository.query.Param("tenantId") String tenantId,
    @org.springframework.data.repository.query.Param("memberId") Long memberId
);

}



