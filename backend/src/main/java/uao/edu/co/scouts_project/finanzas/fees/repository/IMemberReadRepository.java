package uao.edu.co.scouts_project.finanzas.fees.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import uao.edu.co.scouts_project.finanzas.fees.model.read.MemberView;
import uao.edu.co.scouts_project.finanzas.fees.repository.projection.MemberHierarchyRow;

public interface IMemberReadRepository extends JpaRepository<MemberView, Long> {

  @Query(value = """
      select * from member m
      where m.tenant_id = :tenantId
        and m.role = 'SCOUT'
      """, nativeQuery = true)
  List<MemberView> findScoutsByTenant(Long tenantId);

  @Query(value = """
      select * from member m
      where m.tenant_id = :tenantId
        and m.role = 'SCOUT'
        and m.memberid = :memberId
      """, nativeQuery = true)
  List<MemberView> findScoutById(Long tenantId, Long memberId);

  @Query(value = """
      select m.* from member m
      join subgroup sg on sg.subgroup_id = m.subgroup_id
      where m.tenant_id = :tenantId
        and m.role = 'SCOUT'
        and sg.section_id = :sectionId
      """, nativeQuery = true)
  List<MemberView> findScoutsBySection(Long tenantId, Long sectionId);

  @Query(value = """
      select * from member m
      where m.tenant_id = :tenantId
        and m.role = 'SCOUT'
        and m.subgroup_id = :subgroupId
      """, nativeQuery = true)
  List<MemberView> findScoutsBySubgroup(Long tenantId, Long subgroupId);

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
  List<MemberHierarchyRow> findHierarchyByTenant(@Param("tenantId") Long tenantId);
  
}
