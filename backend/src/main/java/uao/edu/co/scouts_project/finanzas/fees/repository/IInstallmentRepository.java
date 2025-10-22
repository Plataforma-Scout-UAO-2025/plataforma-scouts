package uao.edu.co.scouts_project.finanzas.fees.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import uao.edu.co.scouts_project.finanzas.dashboard.repository.projection.InstallmentStatusCount;
import uao.edu.co.scouts_project.finanzas.dashboard.repository.projection.SubgroupCompliance;
import uao.edu.co.scouts_project.finanzas.dashboard.repository.projection.TopDebtorProjection;
import uao.edu.co.scouts_project.finanzas.fees.model.Installment;

public interface IInstallmentRepository extends JpaRepository<Installment, Long> {

    List<Installment> findByConceptId(Long conceptId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
        value = """
            DELETE FROM installment
            WHERE concept_id = :conceptId
              AND (payments IS NULL OR payments = '[]'::jsonb)
            """,
        nativeQuery = true
    )
    int deleteEmptyPaymentsByConcept(@org.springframework.data.repository.query.Param("conceptId") Long conceptId);

    @org.springframework.data.jpa.repository.Query(
        value = """
            SELECT COUNT(*) 
            FROM installment 
            WHERE concept_id = :conceptId
            """,
        nativeQuery = true
    )
    long countAllByConcept(@org.springframework.data.repository.query.Param("conceptId") Long conceptId);

    // ------------------ DASHBOARD ------------------

    /**
     * Suma de montos de cuotas con estado PENDING (según tenant).
     */
    @Query(
        value = """
            SELECT COALESCE(SUM(i.amount), 0)
            FROM installment i
            WHERE i.tenant_id = :tenantId
              AND i.status = 'PENDING'
            """,
        nativeQuery = true
    )
    BigDecimal sumPendingByTenant(@Param("tenantId") String tenantId);

    /**
     * Marca como OVERDUE las cuotas vencidas (due_date < hoy) con saldo > 0
     * que aún no estén marcadas OVERDUE. Devuelve filas afectadas.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
        UPDATE installment i
        SET status = 'OVERDUE'
        WHERE i.tenant_id = :tenantId
        AND i.status NOT IN ('OVERDUE', 'PAID')
        AND i.balance > 0
        AND i.due_date < CURRENT_DATE
        AND COALESCE(jsonb_array_length(i.payments), 0) = 0
        """,
        nativeQuery = true
    )
    int markPastDueAsOverdue(@Param("tenantId") String tenantId);

    /**
     * Cuotas vencidas por tenant (status = OVERDUE).
     */
    @Query(
        value = """
            SELECT COUNT(*)
            FROM installment i
            WHERE i.tenant_id = :tenantId
              AND i.status = 'OVERDUE'
            """,
        nativeQuery = true
    )
    long countOverdueByTenant(@Param("tenantId") String tenantId);

    /**
     * Cuotas que deberían estar OVERDUE (due_date < hoy y balance > 0) pero no lo están.
     * Útil si no quieres auto-corregir y deseas reportar la inconsistencia.
     */
    @Query(
        value = """
            SELECT COUNT(*)
            FROM installment i
            WHERE i.tenant_id = :tenantId
              AND i.balance > 0
              AND i.due_date < CURRENT_DATE
              AND i.status <> 'OVERDUE'
            """,
        nativeQuery = true
    )
    long countShouldBeOverdueButNotMarked(@Param("tenantId") String tenantId);

    @org.springframework.data.jpa.repository.Query(
        value = """
            SELECT 
            a.member_id      AS memberId,
            m.first_name     AS firstName,
            m.last_name      AS lastName,
            sg.name          AS subgroupName,
            COALESCE(SUM(i.amount), 0) AS amountDebt
            FROM installment i
            JOIN account   a  ON a.account_id   = i.account_id
            JOIN member    m  ON m.member_id    = a.member_id
            LEFT JOIN subgroup sg ON sg.subgroup_id = m.subgroup_id
            WHERE i.tenant_id = :tenantId
            AND i.status    = 'OVERDUE'
            GROUP BY a.member_id, m.first_name, m.last_name, sg.name
            ORDER BY amountDebt DESC
            """,
        nativeQuery = true
    )
    List<TopDebtorProjection> findTopDebtorsByTenant(@Param("tenantId") String tenantId);

    @Query("""
    select i.status as status, count(i) as cnt
    from Installment i
    where i.tenantId = :tenantId
    group by i.status
    """)
    List<InstallmentStatusCount> countByStatusForTenant(@Param("tenantId") String tenantId);

    @Query(value = """
    select
        sg.name as subgroupName,
        coalesce(
        100.0 * sum(case when i.status = 'PAID' then 1 else 0 end)::float
        / nullif(count(*), 0), 0
        ) as pct
    from public.installment i
    join public.account   a  on a.account_id   = i.account_id and a.tenant_id = i.tenant_id
    join public.member    m  on m.member_id    = a.member_id
    join public.subgroup  sg on sg.subgroup_id = m.subgroup_id
    where i.tenant_id = :tenantId
    group by sg.name
    order by pct asc
    limit 5
    """, nativeQuery = true)
    List<SubgroupCompliance> findBottom5SubgroupCompliance(@Param("tenantId") String tenantId);

    @Query(value = """
    select coalesce(sum(i.amount), 0)
    from public.installment i
    where i.tenant_id = :tenantId
        and i.status = 'PAID'
    """, nativeQuery = true)
    BigDecimal sumTotalPagadoByTenant(@Param("tenantId") String tenantId);


}
