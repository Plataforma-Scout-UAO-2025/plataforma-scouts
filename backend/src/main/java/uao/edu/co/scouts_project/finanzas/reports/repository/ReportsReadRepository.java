package uao.edu.co.scouts_project.finanzas.reports.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import uao.edu.co.scouts_project.finanzas.reports.repository.projection.MemberOverdueCountRow;
import uao.edu.co.scouts_project.finanzas.reports.repository.projection.ReportPaymentsRow;
import uao.edu.co.scouts_project.finanzas.reports.repository.projection.ReportSummaryRow;
import uao.edu.co.scouts_project.finanzas.fees.model.Installment;

public interface ReportsReadRepository extends JpaRepository<Installment, Long> {

  // ---------- 1) Payments (lista) ----------
  @Query(value = """
      SELECT
        (p->>'payment_id')                   AS paymentId,
        m.first_name                         AS firstName,
        m.last_name                          AS lastName,
        i.amount                             AS amount,
        (p->>'paid_at')::date           AS paidAt
      FROM installment i
      JOIN account   a ON a.account_id = i.account_id
      JOIN member    m ON m.member_id  = a.member_id
      JOIN subgroup  s ON s.subgroup_id = m.subgroup_id
      LEFT JOIN LATERAL jsonb_array_elements(COALESCE(i.payments, '[]'::jsonb)) p ON TRUE
      WHERE
        i.tenant_id = :tenantId
        AND a.tenant_id = :tenantId
        AND m.tenant_id = :tenantId
        AND s.tenant_id = :tenantId
        AND (p->>'paid_at') IS NOT NULL
        AND (p->>'paid_at')::date BETWEEN :start AND :end
        AND (
          (:scope = 'MEMBER'   AND m.member_id::text    = :id)
          OR (:scope = 'SUBGROUP' AND m.subgroup_id::text = :id)
          OR (:scope = 'SECTION'  AND s.section_id::text  = :id)
        )
      ORDER BY paidAt DESC
      LIMIT 100
      """, nativeQuery = true)
  List<ReportPaymentsRow> findPayments(
      @Param("tenantId") String tenantId,
      @Param("start") LocalDate start,
      @Param("end") LocalDate end,
      @Param("scope") String scope,
      @Param("id") String id
  );

  // ---------- 2) Summary (income/pending/overdue por estado del installment) ----------
  @Query(value = """
      SELECT
        COALESCE(SUM(CASE WHEN i.status = 'PAID'    THEN i.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN i.status = 'PENDING' THEN i.amount ELSE 0 END), 0) AS pending,
        COALESCE(SUM(CASE WHEN i.status = 'OVERDUE' THEN i.amount ELSE 0 END), 0) AS overdue
      FROM installment i
      JOIN account  a ON a.account_id  = i.account_id
      JOIN member   m ON m.member_id   = a.member_id
      JOIN subgroup s ON s.subgroup_id = m.subgroup_id
      WHERE
        i.tenant_id = :tenantId
        AND a.tenant_id = :tenantId
        AND m.tenant_id = :tenantId
        AND s.tenant_id = :tenantId
        AND i.due_date BETWEEN :start AND :end
        AND (
          (:scope = 'MEMBER'   AND m.member_id::text    = :id)
          OR (:scope = 'SUBGROUP' AND m.subgroup_id::text = :id)
          OR (:scope = 'SECTION'  AND s.section_id::text  = :id)
        )
      """, nativeQuery = true)
  ReportSummaryRow summarizeByStatus(
      @Param("tenantId") String tenantId,
      @Param("start") LocalDate start,
      @Param("end") LocalDate end,
      @Param("scope") String scope,
      @Param("id") String id
  );

  // ---------- 3) Conteo de miembros con / sin moras ----------
  @Query(value = """
      WITH scoped_members AS (
        SELECT DISTINCT m.member_id
        FROM member m
        JOIN subgroup s ON s.subgroup_id = m.subgroup_id
        WHERE
          m.tenant_id = :tenantId
          AND s.tenant_id = :tenantId
          AND (
            (:scope = 'MEMBER'   AND m.member_id::text    = :id)
            OR (:scope = 'SUBGROUP' AND m.subgroup_id::text = :id)
            OR (:scope = 'SECTION'  AND s.section_id::text  = :id)
          )
      ),
      overdue_members AS (
        SELECT DISTINCT a.member_id
        FROM installment i
        JOIN account a ON a.account_id = i.account_id
        WHERE
          i.tenant_id = :tenantId
          AND a.tenant_id = :tenantId
          AND i.status = 'OVERDUE'
          AND i.due_date BETWEEN :start AND :end
          AND a.member_id IN (SELECT member_id FROM scoped_members)
      )
      SELECT
        (SELECT COUNT(*) FROM scoped_members)  AS totalMembers,
        (SELECT COUNT(*) FROM overdue_members) AS membersOverdue
      """, nativeQuery = true)
  MemberOverdueCountRow countMembersOverdue(
      @Param("tenantId") String tenantId,
      @Param("start") LocalDate start,
      @Param("end") LocalDate end,
      @Param("scope") String scope,
      @Param("id") String id
  );
}