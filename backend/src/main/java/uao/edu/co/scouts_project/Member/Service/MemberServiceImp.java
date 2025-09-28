package uao.edu.co.scouts_project.Member.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.Member.Model.Enums.Estado;
import uao.edu.co.scouts_project.Member.Model.MemberModel;
import uao.edu.co.scouts_project.Member.Repository.IMemberRepository;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
@Primary
public class MemberServiceImp implements IMemberService {

    @Autowired
    private IMemberRepository miembroRepository;

    @Override
    public MemberModel create_member(MemberModel miembro) {
        try {
            if (miembroRepository.findById(miembro.getMember_id()).isPresent()) {
                throw new Exception("Ya existe un miembro con la identificación " + miembro.getMember_id());
            }
            this.miembroRepository.save(miembro);
            log.info(" Miembro preregistrado: {}", miembro);
        } catch (Exception e) {
            log.error("Error inesperado al registrar miembro", e);
        }
        return miembro;
    }

    @Override
    public List<MemberModel> list_members() {
        List<MemberModel> miembros = miembroRepository.findAll();
        log.info("Recuperados {} miembros desde la BD", miembros.size());
        return miembros.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(MemberModel::getLastname, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                        .thenComparing(MemberModel::getFirstname, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<MemberModel> get_member_by_id(Integer member_id) {
        if (member_id == null || member_id <= 0) {
            log.warn("Invalid search by id: {}", member_id);
            return Optional.empty();
        }
        Optional<MemberModel> maybeMember = miembroRepository.findById(member_id);

        if (maybeMember.isPresent()) {
            MemberModel m = maybeMember.get();
            if (m.getFirstname() == null || m.getLastname() == null) {
                log.warn("Member found (id={}) with incomplete data", member_id);
            } else {
                log.info("Member found: id={}, firstname={} lastname={}", member_id, m.getFirstname(), m.getLastname());
            }
        } else {
            log.info("Member not found: id={}", member_id);
        }

        return maybeMember;
    }


    @Override
    public Boolean update_status(Integer member_id, Estado nuevoEstado) {
        Optional<MemberModel> memberOpt = miembroRepository.findById(member_id);

        if (memberOpt.isEmpty()) {
            log.warn("Intento de actualizar estado para miembro inexistente con ID {}", member_id);
            return false;
        }
        MemberModel member = (MemberModel) memberOpt.get();

        if (member.getStatus() == nuevoEstado) {
            log.info("El miembro {} ya tiene el estado {}", member_id, nuevoEstado);
            return false;
        }

        switch (nuevoEstado) {
            case ACCEPTED -> {
                log.info("Miembro {} aceptado", member_id);
                member.setStatus(Estado.valueOf(String.valueOf(Estado.ACCEPTED)));
            }
            case NOT_ACCEPTED -> {
                log.info("Miembro {} no aceptado", member_id);
                member.setStatus(Estado.valueOf(String.valueOf(Estado.NOT_ACCEPTED)));
                member.setAcceptance_date(null);
            }
        }

        miembroRepository.save(member);
        return true;
    }


    @Override
    public Optional<MemberModel> update_member_by_id(Integer idMiembro, MemberModel miembroUpdate) {
        if (idMiembro == null || idMiembro <= 0) {
            log.warn("Intento de actualización con ID inválido: {}", idMiembro);
            return Optional.empty();
        }

        return miembroRepository.findById(idMiembro).map(miembroExistente -> {
            log.info("Iniciando actualización del miembro con ID: {}", idMiembro);

            BeanUtils.copyProperties(miembroUpdate, miembroExistente, getNullPropertyNames(miembroUpdate));
            MemberModel miembroActualizado = miembroRepository.save(miembroExistente);
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
    public List<MemberModel> list_members_by_status(Estado estado) {
        log.info("Listando miembros con estado {}", estado);
        return miembroRepository.findByEstado(estado);
    }





}



