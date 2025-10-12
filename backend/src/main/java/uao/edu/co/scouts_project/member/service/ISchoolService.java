package uao.edu.co.scouts_project.member.service;

import uao.edu.co.scouts_project.member.model.SchoolData;

import java.util.Optional;


/**
 * Servicio que define las operaciones de negocio relacionadas
 * con los datos escolares de los miembros.
 * <p>
 * Esta interfaz actúa como contrato para la implementación del
 * servicio, centralizando la lógica de creación y consulta
 * de información escolar asociada a un miembro.
 */
public interface ISchoolService {

    /**
     * Crea y guarda los datos escolares de un miembro.
     *
     * @param school Objeto {@link SchoolData} con la información escolar.
     * @return Los datos escolares creados con la información persistida.
     */
    SchoolData create_school(SchoolData school);


    /**
     * Obtiene los datos escolares de un miembro dado
     * @param memberId ID del miembro
     * @return Los datos escolares creados para el miembro.
     */
    Optional<SchoolData> getSchoolDataByMemberId(Long memberId);

}