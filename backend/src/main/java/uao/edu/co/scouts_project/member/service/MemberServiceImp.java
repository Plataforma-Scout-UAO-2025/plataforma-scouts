package uao.edu.co.scouts_project.member.service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import uao.edu.co.scouts_project.infrastructure.security.JwtUtilService;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.repository.IMemberRepository;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
@Primary
public class MemberServiceImp implements IMemberService {

    @Autowired
    private IMemberRepository memberRepository;

    @Autowired
    private JwtUtilService jwtUtilService;

    @Override
    public Member create_member(Member miembro) {
        try {
            Optional<Member> existingMember = memberRepository.findByIdentification(miembro.getIdentification());
            if (existingMember.isPresent()) {
                log.warn("Intento de crear miembro duplicado con identificación: {}", miembro.getIdentification());
                throw new IllegalArgumentException("Ya existe un miembro con la identificación " + miembro.getIdentification());
            }

            String userId = jwtUtilService.getCurrentUserId();
            String tenantId = jwtUtilService.getCurrentTenantId();

            log.info("Creando miembro - Usuario autenticado: {} | Tenant: {}", userId, tenantId);


            miembro.setUserId(userId);
            miembro.setTenantId(tenantId);

            Member savedMember = memberRepository.save(miembro);
            log.info("Miembro creado exitosamente con ID: {}", savedMember.getMemberId());

            return savedMember;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado al crear el miembro", e);
            throw new RuntimeException("Error interno al crear el miembro", e);
        }
    }


    @Override
    public List<Member> list_members() {
        List<Member> miembros = memberRepository.findAll();
        log.info("Recuperados {} miembros desde la BD", miembros.size());
        return miembros.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(Member::getLastName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                        .thenComparing(Member::getFirstName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Member> get_member_by_id(Long member_id) {
        if (member_id == null || member_id <= 0) {
            log.warn("Invalid search by id: {}", member_id);
            return Optional.empty();
        }
        Optional<Member> maybeMember = memberRepository.findById(member_id);

        if (maybeMember.isPresent()) {
            Member m = maybeMember.get();
            if (m.getFirstName() == null || m.getLastName() == null) {
                log.warn("Member found (id={}) with incomplete data", member_id);
            } else {
                log.info("Member found: id={}, firstname={} lastname={}", member_id, m.getFirstName(), m.getLastName());
            }
        } else {
            log.info("Member not found: id={}", member_id);
        }

        return maybeMember;
    }


    @Override
    public Boolean update_status(Integer memberId, String nuevoStatus) {
        Optional<Member> memberOpt = memberRepository.findById(memberId);

        if (memberOpt.isEmpty()) {
            log.warn("Intento de actualizar estado para miembro inexistente con ID {}", memberId);
            return false;
        }

        Member member = memberOpt.get();

        try {
            Status statusEnum = Status.valueOf(nuevoStatus.toUpperCase());

            if (member.getStatus() == statusEnum) {
                log.info("El miembro {} ya tiene el estado {}", memberId, statusEnum);
                return false;
            }

            member.setStatus(statusEnum);

            switch (statusEnum) {
                case APPROVED -> {
                    log.info("Miembro {} aprobado", memberId);
                    member.setAcceptanceDate(LocalDate.now());
                }
                case REJECTED -> {
                    log.info("Miembro {} rechazado", memberId);
                    member.setAcceptanceDate(null);
                }
                case PENDING -> {
                    log.info("Miembro {} pendiente", memberId);
                    member.setAcceptanceDate(null);
                }
            }

            memberRepository.save(member);
            log.info("Estado del miembro {} actualizado a {}", memberId, statusEnum);
            return true;

        } catch (IllegalArgumentException e) {
            log.warn("Estado '{}' no reconocido para miembro {}. Valores válidos: {}",
                    nuevoStatus, memberId, Arrays.toString(Status.values()));
            return false;
        } catch (Exception e) {
            log.error("Error actualizando estado del miembro {}: {}", memberId, e.getMessage(), e);
            return false;
        }
    }



    @Override
    public Optional<Member> update_member_by_id(Integer idMiembro, Member miembroUpdate) {
        if (idMiembro == null || idMiembro <= 0) {
            log.warn("Intento de actualización con ID inválido: {}", idMiembro);
            return Optional.empty();
        }

        return memberRepository.findById(idMiembro).map(miembroExistente -> {
            log.info("Iniciando actualización del miembro con ID: {}", idMiembro);

            BeanUtils.copyProperties(miembroUpdate, miembroExistente, getNullPropertyNames(miembroUpdate));
            Member miembroActualizado = memberRepository.save(miembroExistente);
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
    public List<Member> list_members_by_status(String status) {
        log.info("Listando miembros con estado {}", status);
        return memberRepository.findByStatus(status);
    }





}



