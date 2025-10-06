package uao.edu.co.scouts_project.finanzas.fees.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import uao.edu.co.scouts_project.finanzas.fees.model.read.MemberView;
import uao.edu.co.scouts_project.finanzas.fees.repository.projection.IdNameProjection;
import uao.edu.co.scouts_project.finanzas.fees.repository.projection.MemberHierarchyRow;

public interface IMemberReadRepository extends JpaRepository<MemberView, Long> {

  @Query(value = """
      select * from member m
      where m.tenant_id = :tenantId
        and m.role = 'SCOUT'
      """, nativeQuery = true)
  List<MemberView> findScoutsByTenant(String tenantId);

  @Query(value = """
      select * from member m
      where m.tenant_id = :tenantId
        and m.role = 'SCOUT'
        and m.member_id = :memberId
      """, nativeQuery = true)
  List<MemberView> findScoutById(String tenantId, Long memberId);

  @Query(value = """
      select m.* from member m
      join subgroup sg on sg.subgroup_id = m.subgroup_id
      where m.tenant_id = :tenantId
        and m.role = 'SCOUT'
        and sg.section_id = :sectionId
      """, nativeQuery = true)
  List<MemberView> findScoutsBySection(String tenantId, Long sectionId);

  @Query(value = """
      select * from member m
      where m.tenant_id = :tenantId
        and m.role = 'SCOUT'
        and m.subgroup_id = :subgroupId
      """, nativeQuery = true)
  List<MemberView> findScoutsBySubgroup(String tenantId, Long subgroupId);

    @Query(value = """
      SELECT
        m.member_id      AS memberId,
        m.first_name     AS firstName,
        m.last_name      AS lastName,
        m.age            AS age,
        m.subgroup_id    AS subgroupId,
        sg.name          AS subgroupName,
        s.section_id     AS sectionId,
        s.name           AS sectionName,
        m.tenant_id      AS tenantId
      FROM member m
      LEFT JOIN subgroup sg ON sg.subgroup_id = m.subgroup_id
      LEFT JOIN section  s  ON s.section_id = sg.section_id
      WHERE m.tenant_id = :tenantId
        AND m.role = 'SCOUT'
      ORDER BY m.member_id
      """, nativeQuery = true)
  List<MemberHierarchyRow> findHierarchyByTenant(@Param("tenantId") String tenantId);
  
  @Query(value = """
      SELECT DISTINCT
        sg.subgroup_id AS id,
        sg.name        AS name
      FROM member mv
      JOIN subgroup sg       ON sg.subgroup_id = mv.subgroup_id
      WHERE sg.tenant_id = :tenantId
      ORDER BY name
      """, nativeQuery = true)
  List<IdNameProjection> findDistinctSubgroupsByTenant(@Param("tenantId") String tenantId);

  @Query(value = """
      SELECT DISTINCT
        se.section_id AS id,
        se.name       AS name
      FROM member mv
      JOIN subgroup sg ON sg.subgroup_id = mv.subgroup_id
      JOIN section  se ON se.section_id  = sg.section_id
      WHERE se.tenant_id = :tenantId
      ORDER BY name
      """, nativeQuery = true)
  List<IdNameProjection> findDistinctSectionsByTenant(@Param("tenantId") String tenantId);

}
