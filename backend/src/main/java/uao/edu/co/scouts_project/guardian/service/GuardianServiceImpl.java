package uao.edu.co.scouts_project.guardian.service;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWIthMemberDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.*;
import uao.edu.co.scouts_project.guardian.mapper.GuardianMapper;
import uao.edu.co.scouts_project.guardian.model.Member;
import uao.edu.co.scouts_project.guardian.model.MemberCustom;
import uao.edu.co.scouts_project.guardian.repository.GuardianRepository;
import uao.edu.co.scouts_project.infrastructure.security.Role;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GuardianServiceImpl implements GuardianService {

    private static final Logger logger = LoggerFactory.getLogger(GuardianServiceImpl.class);
    private final GuardianRepository memberRepository;

    public GuardianServiceImpl(GuardianRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuardianCreateDTO> findAllGuardians() {
        logger.info("Listando todos los guardians");
        List<GuardianCreateDTO> guardians = memberRepository.findAll().stream()
                .filter(this::isGuardian)
                .map(GuardianMapper::toGuardianCreateDTO)
                .collect(Collectors.toList());

        if (guardians.isEmpty()) {
            logger.warn("No se encontraron guardians en el sistema");
        }

        return guardians;
    }

    @Override
    @Transactional(readOnly = true)
    public GuardianCreateDTO findGuardianById(String id) {
        logger.info("Buscando guardian por id: {}", id);
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new MemberNotFoundException("Miembro con ID " + id + " no encontrado"));

        validateIsGuardian(member, "El miembro con ID " + id + " no es un guardian");

        return GuardianMapper.toGuardianCreateDTO(member);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuardianCreateDTO> findGuardiansByStatus(boolean active) {
        logger.info("Buscando guardians por estado: {}", active);
        return memberRepository.findByIsActive(active).stream()
                .filter(this::isGuardian)
                .map(GuardianMapper::toGuardianCreateDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberDTO> findMembersInChargeOf(String guardianId) {
        logger.info("Buscando miembros a cargo del guardian: {}", guardianId);

        validateGuardianExists(guardianId);

        Integer guardianIdInt = Integer.parseInt(guardianId);
        List<MemberCustom> membersCustom = memberRepository.findMembersImInChargeOf(guardianIdInt);

        return membersCustom.stream()
                .map(GuardianMapper::toMemberDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GuardianWIthMemberDTO findGuardianWithMembers(String guardianId) {
        logger.info("Buscando guardian con sus miembros: {}", guardianId);

        Member guardian = memberRepository.findById(guardianId)
                .orElseThrow(() -> new GuardianNotFoundException("Guardian con ID " + guardianId + " no encontrado"));

        validateIsGuardian(guardian, "El miembro con ID " + guardianId + " no es un guardian");

        List<MemberDTO> membersInCharge = findMembersInChargeOf(guardianId);
        return GuardianMapper.toDTO(guardian, membersInCharge);
    }

    @Override
    @Transactional
    public GuardianCreateDTO saveGuardian(GuardianCreateDTO guardianCreateDTO) {
        logger.info("Creando nuevo guardian");

        if (memberRepository.findById(guardianCreateDTO.getUserId()).isPresent()) {
            throw new InvalidGuardianException("Ya existe un miembro con el ID " + guardianCreateDTO.getUserId());
        }

        Member guardian = GuardianMapper.toEntity(guardianCreateDTO);
        guardian.setRole(getRoleForGuardian());

        Member savedGuardian = memberRepository.save(guardian);
        logger.info("Guardian creado con ID: {}", savedGuardian.getUserId());
        return GuardianMapper.toGuardianCreateDTO(savedGuardian);
    }

    @Override
    @Transactional
    public GuardianCreateDTO updateGuardianById(String guardianId, GuardianCreateDTO guardianCreateDTO) {
        logger.info("Actualizando guardian con ID: {}", guardianId);

        Member existingGuardian = memberRepository.findById(guardianId)
                .orElseThrow(() -> new GuardianNotFoundException("Guardian con ID " + guardianId + " no encontrado"));

        validateIsGuardian(existingGuardian, "El miembro con ID " + guardianId + " no es un guardian");

        updateGuardianFields(existingGuardian, guardianCreateDTO);
        Member savedGuardian = memberRepository.save(existingGuardian);
        logger.info("Guardian {} actualizado exitosamente", guardianId);

        return GuardianMapper.toGuardianCreateDTO(savedGuardian);
    }

    @Override
    @Transactional
    public GuardianCreateDTO addMemberToGuardian(String guardianId, String memberId) {
        logger.info("Añadiendo miembro {} al guardian {}", memberId, guardianId);

        Member guardian = memberRepository.findById(guardianId)
                .orElseThrow(() -> new GuardianNotFoundException("Guardian con ID " + guardianId + " no encontrado"));

        validateIsGuardian(guardian, "El miembro con ID " + guardianId + " no es un guardian");

        Member memberToAdd = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberNotFoundException("Miembro con ID " + memberId + " no encontrado"));

        if (isGuardian(memberToAdd)) {
            throw new InvalidGuardianException("No se puede asignar un guardian como miembro de otro guardian");
        }

        if (memberToAdd.getGuardianId() != null) {
            throw new MemberAlreadyAssignedException("El miembro con ID " + memberId + " ya está asignado a otro guardian");
        }

        memberToAdd.setGuardianId(Integer.parseInt(guardianId));
        memberRepository.save(memberToAdd);
        logger.info("Miembro {} añadido exitosamente al guardian {}", memberId, guardianId);

        return GuardianMapper.toGuardianCreateDTO(guardian);
    }

    @Override
    @Transactional
    public GuardianCreateDTO removeMemberFromGuardian(String guardianId, String memberId) {
        logger.info("Removiendo miembro {} del guardian {}", memberId, guardianId);

        Member guardian = memberRepository.findById(guardianId)
                .orElseThrow(() -> new GuardianNotFoundException("Guardian con ID " + guardianId + " no encontrado"));

        validateIsGuardian(guardian, "El miembro con ID " + guardianId + " no es un guardian");

        Member memberToRemove = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberNotFoundException("Miembro con ID " + memberId + " no encontrado"));

        if (!Integer.valueOf(guardianId).equals(memberToRemove.getGuardianId())) {
            throw new InvalidGuardianException("El miembro con ID " + memberId + " no está asignado al guardian " + guardianId);
        }

        memberToRemove.setGuardianId(null);
        memberRepository.save(memberToRemove);
        logger.info("Miembro {} removido exitosamente del guardian {}", memberId, guardianId);

        return GuardianMapper.toGuardianCreateDTO(guardian);
    }

    @Override
    @Transactional
    public boolean deleteGuardianById(String guardianId) {
        logger.info("Eliminando guardian con ID: {}", guardianId);

        Member guardian = memberRepository.findById(guardianId)
                .orElseThrow(() -> new GuardianNotFoundException("Guardian con ID " + guardianId + " no encontrado"));

        validateIsGuardian(guardian, "El miembro con ID " + guardianId + " no es un guardian");

        Integer guardianIdInt = Integer.parseInt(guardianId);

        List<Member> membersInCharge = memberRepository.findAll().stream()
                .filter(member -> guardianIdInt.equals(member.getGuardianId()))
                .collect(Collectors.toList());

        membersInCharge.forEach(member -> {
            member.setGuardianId(null);
            memberRepository.save(member);
            logger.info("Referencia de guardian removida del miembro {}", member.getMemberId());
        });

        memberRepository.delete(guardian);
        logger.info("Guardian {} eliminado exitosamente junto con {} referencias de miembros",
                   guardianId, membersInCharge.size());

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberDTO> findAvailableMembers() {
        logger.info("Buscando miembros disponibles para asignar a guardian");
        return memberRepository.findAll().stream()
                .filter(member -> !isGuardian(member) && member.getGuardianId() == null)
                .map(GuardianMapper::toMemberDTO)
                .collect(Collectors.toList());
    }

    // Métodos auxiliares privados
    private boolean isGuardian(Member member) {
        return getRoleForGuardian().equals(member.getRole());
    }

    private void validateIsGuardian(Member member, String errorMessage) {
        if (!isGuardian(member)) {
            throw new InvalidGuardianException(errorMessage);
        }
    }

    private void validateGuardianExists(String guardianId) {
        Member guardian = memberRepository.findById(guardianId)
                .orElseThrow(() -> new GuardianNotFoundException("Guardian con ID " + guardianId + " no encontrado"));

        validateIsGuardian(guardian, "El miembro con ID " + guardianId + " no es un guardian");
    }

    private Role getRoleForGuardian() {
        // TODO: Cambia por el valor correcto de tu enum Role
        // Verifica el archivo Role.java para valores como: PARENT, GUARDIAN, ADMIN, etc.
        return Role.ACUDIENTE; // TEMPORAL - reemplaza con el valor correcto
    }

    private void updateGuardianFields(Member existingGuardian, GuardianCreateDTO dto) {
        existingGuardian.setFirstName(dto.getFirstName());
        existingGuardian.setLastName(dto.getLastName());
        existingGuardian.setAge(dto.getAge());
        existingGuardian.setIdentification(dto.getIdentification());
        existingGuardian.setDocumentType(dto.getDocumentType());
        existingGuardian.setPhone(dto.getPhone());
        existingGuardian.setIsActive(dto.getIsActive());
        existingGuardian.setRelationship(dto.getRelationship());
        existingGuardian.setStatus(dto.getStatus());
        existingGuardian.setAcceptanceDate(dto.getAcceptanceDate());
    }
}