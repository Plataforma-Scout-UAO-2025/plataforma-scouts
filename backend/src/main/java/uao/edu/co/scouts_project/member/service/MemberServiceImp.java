package uao.edu.co.scouts_project.member.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import uao.edu.co.scouts_project.member.MemberStatusException;
import uao.edu.co.scouts_project.member.dto.MemberWithSubgroupAndSectionDto;
import uao.edu.co.scouts_project.member.mapper.MemberWithSubgroupAndSectionMapper;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.repository.IMemberRepository;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import uao.edu.co.scouts_project.domain.port.PermissionQueryPort;
import uao.edu.co.scouts_project.organigrama.model.Section;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;
import uao.edu.co.scouts_project.organigrama.repository.SectionRepository;
import uao.edu.co.scouts_project.organigrama.repository.SubgroupRepository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementación del servicio {@link IMemberService}.
 * <p>
 * Contiene la lógica de negocio para la gestión de miembros:
 * creación, listado, búsqueda, actualización y manejo de estados.
 */
@Slf4j
@Service
@Primary
public class MemberServiceImp implements IMemberService {

    @Autowired
    private IMemberRepository memberRepository;

    @Autowired
    private SubgroupRepository subgroupRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private MemberWithSubgroupAndSectionMapper memberWithSubgroupAndSectionMapper;

    @Autowired
    private PermissionQueryPort permissionQueryPort;



    /**
     * Crea un nuevo miembro validando duplicados e información obligatoria.
     *
     * @param miembro Objeto {@link Member} con la información del miembro.
     * @return El miembro creado con su información persistida.
     */
    @Override
    public Member create_member(Member miembro) {
        validateMemberData(miembro);

        try {
            Optional<Member> existingMember = memberRepository.findByIdentification(miembro.getIdentification());
            if (existingMember.isPresent()) {
                log.warn("Attempt to create duplicate member with identification: {}", miembro.getIdentification());
                throw new IllegalArgumentException("A member with identification " + miembro.getIdentification() + " already exists");
            }

            String userId = SecurityContextHolder.getContext().getAuthentication().getName();
            log.info("Creating member - Authenticated user: {}", userId);
            if (miembro.getStatus() == null) {
                miembro.setStatus(Status.PENDING);
            }

            miembro.setUserId(userId);

            Member savedMember = memberRepository.save(miembro);
            log.info("Member created successfully with ID: {}", savedMember.getMemberId());
            return savedMember;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating member", e);
            throw new RuntimeException("Internal error creating member", e);
        }
    }



    /**
     * Lista todos los miembros registrados, ordenados por apellido y nombre.
     *
     * @return Lista de objetos {@link Member}.
     */
    @Override
    @Transactional(readOnly = true)
    public List<Member> get_members() {
        List<Member> members = memberRepository.findAll();
        log.info("Retrieved {} members from database", members.size());

        return members.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(Member::getLastName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                        .thenComparing(Member::getFirstName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .collect(Collectors.toList());
    }



    /**
     * Obtiene un miembro por su ID.
     *
     * @param memberId Identificador único del miembro.
     * @return {@link Optional} con el miembro si existe.
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Member> get_member_by_id(Long memberId) {
        if (memberId == null || memberId <= 0) {
            log.warn("Invalid member ID for search: {}", memberId);
            return Optional.empty();
        }

        Optional<Member> maybeMember = memberRepository.findById(memberId);

        if (maybeMember.isPresent()) {
            Member m = maybeMember.get();
            log.info("Member found: id={}, firstname={}, lastname={}", memberId, m.getFirstName(), m.getLastName());
        } else {
            log.info("Member not found: id={}", memberId);
        }

        return maybeMember;
    }



    /**
     * Obtiene un miembro por su ID.
     *
     * @param subGroupId Identificador único del miembro.
     * @return {@link Optional} con el miembro si existe.
     */
    @Override
    public Optional<List<Member>> get_members_by_subGroupId(Long subGroupId) {
        if (subGroupId == null || subGroupId <= 0) {
            log.warn("Invalid subgroup ID for search: {}", subGroupId);
            return Optional.empty();
        }

        List<Member> members = memberRepository.findBySubGroupId(subGroupId);

        if (members.isEmpty()) {
            log.info("No members found for subgroupId={}", subGroupId);
            return Optional.empty();
        }

        log.info("Found {} members for subgroupId={}", members.size(), subGroupId);
        return Optional.of(members);
    }


    /**
     * Lista los miembros filtrados por estado.
     *
     * @param status Estado del miembro (PENDING, APPROVED, REJECTED, etc.).
     * @return Lista de miembros con el estado especificado.
     */
    @Override
    @Transactional(readOnly = true)
    public List<Member> get_members_by_status(String status) {
        if (status == null || status.isBlank()) {
            log.warn("Null or blank status provided for member search");
            throw new IllegalArgumentException("Status cannot be null or blank");
        }

        Status enumStatus;
        try {
            enumStatus = Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status received: {}", status);
            throw new IllegalArgumentException("Invalid status value: " + status);
        }

        log.info("Listing members with status: {}", enumStatus);
        List<Member> members = memberRepository.findByStatus(enumStatus);

        return members.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(Member::getLastName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                        .thenComparing(Member::getFirstName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .collect(Collectors.toList());
    }


    /**
     * Obtiene todos los miembros del tenant del usuario autenticado con información completa de subgrupo y sección.
     * El tenantId se obtiene del JWT token (claim org_id) usando PermissionQueryPort.
     * Utiliza JOIN FETCH para evitar N+1 queries y obtener toda la información en consultas optimizadas.
     *
     * @return Lista de DTOs con información completa del miembro, subgrupo y sección.
     */
    @Override
    @Transactional(readOnly = true)
    public List<MemberWithSubgroupAndSectionDto> get_members_with_subgroup_and_section() {
        try {
            // Obtener el tenantId (org_id) del usuario autenticado desde el JWT
            String tenantId = null;
            try {
                tenantId = permissionQueryPort.getCurrentUserOrgId();
            } catch (Exception e) {
                log.error("Error al obtener org_id del usuario autenticado: {}", e.getMessage(), e);
                throw new IllegalStateException("No se pudo obtener la organización del usuario autenticado", e);
            }

            if (tenantId == null || tenantId.isBlank()) {
                log.error("El org_id del usuario autenticado es null o vacío. Verifica que el claim 'org_id' esté presente en el JWT.");
                throw new IllegalStateException("No se pudo determinar la organización del usuario autenticado");
            }

            log.info("Fetching members with subgroup and section for authenticated user's tenantId: {}", tenantId);

            // 1. Obtener todos los miembros con subgrupos usando JOIN FETCH
            List<Member> members = memberRepository.findMembersWithSubgroupByTenantId(tenantId);

            if (members.isEmpty()) {
                log.info("No members found for tenantId: {}", tenantId);
                return Collections.emptyList();
            }

            log.info("Found {} members for tenantId: {}", members.size(), tenantId);

            // 2. Recolectar todos los sectionIds únicos de los subgrupos
            Set<Long> sectionIds = members.stream()
                    .map(Member::getSubgroup)
                    .filter(Objects::nonNull)
                    .map(Subgroup::getSectionId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            log.debug("Found {} unique sections to fetch", sectionIds.size());

            // 3. Obtener todas las secciones en una sola consulta
            Map<Long, Section> sectionsMap = new HashMap<>();
            if (!sectionIds.isEmpty()) {
                List<Section> sections = sectionRepository.findAllById(sectionIds);
                sectionsMap = sections.stream()
                        .collect(Collectors.toMap(Section::getSectionId, section -> section));
                log.debug("Fetched {} sections from database", sections.size());
            }

            // 4. Convertir a DTOs usando el mapper con el mapa de secciones
            List<MemberWithSubgroupAndSectionDto> result = memberWithSubgroupAndSectionMapper.toDtoList(members, sectionsMap);

            log.info("Successfully converted {} members to DTOs with complete information", result.size());

            return result;

        } catch (IllegalStateException e) {
            // Re-lanzar excepciones de estado para que el controller las maneje
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado al obtener miembros con detalles completos: {}", e.getMessage(), e);
            throw new RuntimeException("Error al obtener lista de miembros con detalles", e);
        }
    }

    /**
     * Actualiza el estado de un miembro (PENDING, REJECTED o APPROVED).
     *
     * @param memberId   ID del miembro.
     * @param enumStatus Nuevo estado.
     * @return {@code true} si se actualizó correctamente, {@code false} si el estado era el mismo.
     */
    @Override
    public Boolean update_status(Long memberId, Status enumStatus) {
        if (memberId == null || memberId <= 0) {
            throw new IllegalArgumentException("Invalid member ID: " + memberId);
        }
        if (enumStatus == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + memberId));

        if (member.getStatus() == enumStatus) {
            log.info("Member {} already has status {}", memberId, enumStatus);
            throw new MemberStatusException(memberId, enumStatus.name());
        }

        member.setStatus(enumStatus);
        switch (enumStatus) {
            case APPROVED -> member.setAcceptanceDate(LocalDate.now());
            case REJECTED, PENDING -> member.setAcceptanceDate(null);
        }

        memberRepository.save(member);
        log.info("Member {} status updated to {}", memberId, enumStatus);
        return true;
    }



    /**
     * Actualiza la información de un miembro existente sin sobrescribir valores nulos.
     *
     * @param memberId     ID del miembro a actualizar.
     * @param memberUpdate Datos nuevos del miembro.
     * @return El miembro actualizado.
     */
    @Override
    public Member update_member_by_id(Long memberId, Member memberUpdate) {
        if (memberId == null || memberId <= 0) {
            throw new IllegalArgumentException("Invalid member ID: " + memberId);
        }

        Member existingMember = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + memberId));

        log.info("Starting update for member with ID: {}", memberId);

        BeanUtils.copyProperties(memberUpdate, existingMember, getNullPropertyNames(memberUpdate));
        existingMember.setMemberId(memberId);

        Member updatedMember = memberRepository.save(existingMember);
        log.info("Member updated successfully with ID: {}", memberId);
        return updatedMember;
    }

    @Override
    public Boolean update_role(String userId) {
        return null;
    }


    /**
     * Asigna un miembro a un subGrupo existente
     * @param sectionId Id de la seccion a la cual sera asigando el miembro
     * @param memberId  ID del miembro a actualizar.
     * @param subGroupId Id del sub grupo que recibirá al miembro
     * @return el estado booleano de la operación
     */
    @Override
    @Transactional
    public Boolean assignSubgroupAndSection(Long memberId, Long subGroupId, Long sectionId) {
        try {
            Optional<Member> memberOpt = memberRepository.findById(memberId);
            Optional<Subgroup> subgroupOpt = subgroupRepository.findById(subGroupId);

            if (memberOpt.isEmpty() || subgroupOpt.isEmpty()) {
                log.warn("Miembro o subgrupo no encontrado: memberId={}, subGroupId={}", memberId, subGroupId);
                return false;
            }

            Subgroup subgroup = subgroupOpt.get();
            if (!Boolean.TRUE.equals(subgroup.getIsActive())) {
                log.warn("⚠Intento de asignar subgrupo inactivo: {}", subGroupId);
                return false;
            }

            Member member = memberOpt.get();
            member.setSubgroup(subgroup);
            memberRepository.save(member);
            memberRepository.updateSectionByMember(memberId, sectionId);

            log.info("Subgrupo {} y sección {} asignados correctamente al miembro {}", subGroupId, sectionId, memberId);
            return true;

        } catch (Exception e) {
            log.error("Error al asignar subgrupo y sección al miembro {}", memberId, e);
            throw e; // rollback automático
        }
    }



    /** Valida los campos obligatorios del miembro. */
    private void validateMemberData(Member member) {
        if (member == null) {
            throw new IllegalArgumentException("Member cannot be null");
        }
        if (!StringUtils.hasText(member.getFirstName())) {
            throw new IllegalArgumentException("First name is required");
        }
        if (!StringUtils.hasText(member.getLastName())) {
            throw new IllegalArgumentException("Last name is required");
        }
        if (!StringUtils.hasText(member.getIdentification())) {
            throw new IllegalArgumentException("Identification is required");
        }
    }

    /** Obtiene los nombres de las propiedades nulas para ignorarlas en el copiado de propiedades. */
    private String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        Set<String> emptyNames = new HashSet<>();
        for (var pd : src.getPropertyDescriptors()) {
            Object srcValue = src.getPropertyValue(pd.getName());
            if (srcValue == null) emptyNames.add(pd.getName());
        }
        // Ignora campos del sistema
        emptyNames.add("memberId");
        emptyNames.add("userId");
        emptyNames.add("createdAt");
        return emptyNames.toArray(new String[0]);
    }
}