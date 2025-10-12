package uao.edu.co.scouts_project.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uao.edu.co.scouts_project.member.model.SchoolData;
import uao.edu.co.scouts_project.member.repository.ISchoolRepository;

import java.util.Optional;

/**
 * Implementación del servicio que gestiona la lógica de negocio
 * relacionada con los datos escolares de los miembros.
 * <p>
 * Se encarga de validar y persistir la información de la escuela
 * asociada a un miembro dentro del sistema.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SchoolServiceImp implements ISchoolService {

    private final ISchoolRepository schoolRepository;

    /**
     * Crea y guarda un registro de datos escolares en la base de datos.
     *
     * @param schoolData Objeto {@link SchoolData} con la información de la escuela.
     * @return El objeto {@link SchoolData} guardado con su ID asignado.
     * @throws IllegalArgumentException si los datos son nulos o incompletos.
     */
    @Override
    @Transactional
    public SchoolData create_school(SchoolData schoolData) {
        validateSchoolData(schoolData);

        log.info("Creando registro escolar para member_id: {}", schoolData.getMemberId());

        SchoolData savedSchool = schoolRepository.save(schoolData);

        log.info("Registro escolar guardado correctamente con ID: {}", savedSchool.getSchoolDataId());
        return savedSchool;
    }


    @Override
    @Transactional(readOnly = true)
    public Optional<SchoolData> getSchoolDataByMemberId(Long memberId) {
        if (memberId == null) {
            throw new IllegalArgumentException("El memberId no puede ser nulo");
        }

        log.info("Consultando datos escolares del miembro con ID: {}", memberId);
        return schoolRepository.findByMemberId(memberId);
    }


    /**
     * Valida los campos obligatorios de la entidad SchoolData.
     *
     * @param schoolData objeto a validar
     * @throws IllegalArgumentException si falta algún campo requerido
     */
    private void validateSchoolData(SchoolData schoolData) {
        if (schoolData == null) {
            throw new IllegalArgumentException("Los datos de la escuela no pueden ser nulos");
        }

        if (schoolData.getMemberId() == null) {
            throw new IllegalArgumentException("El campo memberId es obligatorio");
        }

        if (schoolData.getTenantId() == null || schoolData.getTenantId().isBlank()) {
            throw new IllegalArgumentException("El campo tenantId es obligatorio");
        }
    }
}