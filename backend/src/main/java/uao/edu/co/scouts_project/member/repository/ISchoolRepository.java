package uao.edu.co.scouts_project.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uao.edu.co.scouts_project.member.model.SchoolData;

import java.util.Optional;

/**
 * Repositorio JPA para la entidad {@link SchoolData}.
 * <p>
 * Permite realizar operaciones CRUD y consultas personalizadas
 * sobre los datos escolares asociados a los miembros del sistema.
 */
public interface ISchoolRepository extends JpaRepository<SchoolData, Long> {

    /**
     * Obtiene una lista de registros escolares asociados a un miembro específico.
     *
     * @param memberId ID del miembro cuyos datos escolares se desean consultar.
     * @return Lista de {@link SchoolData} vinculada al ID del miembro proporcionado.
     */
    @Query("SELECT s FROM SchoolData s WHERE s.memberId = :memberId")
    Optional<SchoolData> findByMemberId(@Param("memberId") Long memberId);
}