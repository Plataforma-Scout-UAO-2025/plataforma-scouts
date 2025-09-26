package uao.edu.co.scouts_project.Miembros.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.Miembros.Dto.MiembroUpdateDto;
import uao.edu.co.scouts_project.Miembros.Model.Enums.Estado;
import uao.edu.co.scouts_project.Miembros.Model.MiembroModel;
import uao.edu.co.scouts_project.Miembros.Repository.IMiembroRepository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
@Primary
public class MiembroServiceImp implements IMiembroService {

    @Autowired
    private IMiembroRepository miembroRepository;

    @Override
    public MiembroModel crearMiembro(MiembroModel miembro) {
        try {
            if (miembroRepository.findById(miembro.getId_miembro()).isPresent()) {
                throw new Exception("Ya existe un miembro con la identificación " + miembro.getId_miembro());
            }
            this.miembroRepository.save(miembro);
            log.info(" Miembro preregistrado: {}", miembro);
        } catch (Exception e) {
            log.error("Error inesperado al registrar miembro", e);
        }
        return miembro;
    }

    @Override
    public List<MiembroModel> listarMiembros() {
        List<MiembroModel> miembros = miembroRepository.findAll();
        log.info("Recuperados {} miembros desde la BD", miembros.size());
        return miembros.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(MiembroModel::getApellidos, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                        .thenComparing(MiembroModel::getNombres, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<MiembroModel> obtenerMiembroPorId(Long identificacion) {
        if (identificacion == null || identificacion <= 0) {
            log.warn("Búsqueda por id inválida: {}", identificacion);
            return Optional.empty();
        }
        Optional<MiembroModel> maybeMiembro = miembroRepository.findById(identificacion);
        if (maybeMiembro.isPresent()) {
            MiembroModel m = maybeMiembro.get();
            if (m.getNombres() == null || m.getApellidos() == null) {
                log.warn("Miembro encontrado (id={}) con datos incompletos", identificacion);
            } else {
                log.info("Miembro encontrado: id={}, nombres={} {}", identificacion, m.getNombres(), m.getApellidos());
            }
        } else {
            log.info("Miembro no encontrado: id={}", identificacion);
        }

        return maybeMiembro;
    }

    @Override
    public Boolean actualizarEstado(Long idMiembro, Estado nuevoEstado) {
        Optional<MiembroModel> miembroOpt = miembroRepository.findById(idMiembro);

        if (miembroOpt.isEmpty()) {
            log.warn("Intento de actualizar estado para miembro inexistente con ID {}", idMiembro);
            return false;
        }
        MiembroModel miembro = miembroOpt.get();

        if (miembro.getEstado() == nuevoEstado) {
            log.info("El miembro {} ya tiene el estado {}", idMiembro, nuevoEstado);
            return false;
        }

        switch (nuevoEstado) {
            case ACEPTADO -> {
                log.info("Miembro {} aceptado", idMiembro);
                miembro.setEstado(Estado.ACEPTADO);
                miembro.setFechaAceptacion(LocalDate.now());
            }
            case NO_ACEPTADO -> {
                log.info("Miembro {} no aceptado", idMiembro);
                miembro.setEstado(Estado.NO_ACEPTADO);
                miembro.setFechaAceptacion(null);
            }
        }

        miembroRepository.save(miembro);
        return true;
    }


    @Override
    public Optional<MiembroModel> actualizarMiembro(Long idMiembro, MiembroModel miembroUpdate) {
        if (idMiembro == null || idMiembro <= 0) {
            log.warn("Intento de actualización con ID inválido: {}", idMiembro);
            return Optional.empty();
        }

        return miembroRepository.findById(idMiembro).map(miembroExistente -> {
            log.info("Iniciando actualización del miembro con ID: {}", idMiembro);

            BeanUtils.copyProperties(miembroUpdate, miembroExistente, getNullPropertyNames(miembroUpdate));
            MiembroModel miembroActualizado = miembroRepository.save(miembroExistente);
            log.info("Miembro actualizado correctamente con ID {}", idMiembro);

            return miembroActualizado;
        });
    }

    /**
     * Retorna los nombres de las propiedades nulas en un objeto (para ignorarlas en el copyProperties).
     */
    private String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        java.beans.PropertyDescriptor[] pds = src.getPropertyDescriptors();

        Set<String> emptyNames = new HashSet<>();
        for (java.beans.PropertyDescriptor pd : pds) {
            Object srcValue = src.getPropertyValue(pd.getName());
            if (srcValue == null) {
                emptyNames.add(pd.getName());
            }
        }
        return emptyNames.toArray(new String[0]);
    }

    @Override
    public List<MiembroModel> listarMiembrosPorEstado(Estado estado) {
        log.info("Listando miembros con estado {}", estado);
        return miembroRepository.findByEstado(estado);
    }





}



