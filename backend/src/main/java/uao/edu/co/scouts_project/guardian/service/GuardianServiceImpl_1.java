package uao.edu.co.scouts_project.guardian.service;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uao.edu.co.scouts_project.guardian.dto.*;
import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.model.Member;
import uao.edu.co.scouts_project.guardian.repository.GuardianRepository;
import uao.edu.co.scouts_project.organigram.Subgroup;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GuardianServiceImpl implements GuardianService {

    private static final Logger logger = LoggerFactory.getLogger(GuardianServiceImpl.class);
    private final GuardianRepository memberRepository;

    public GuardianServiceImpl(GuardianRepository memberRepository) {
        this.memberRepository = memberRepository;
    }


    // TODO: Throw exceptions based on the examples given in ControllerExceptionHandler

    @Override
    @Transactional(readOnly = true)
    public List<GuardianCreateDTO> findAllGuardians() {
        logger.info("Listando todos los guardians");
        return memberRepository.findAll().stream()
                .filter(this::isGuardian).map(this::convertToGuardianDTO)
                .collect(Collectors.toList());
        if (guardian != null) {
            throw new NotFoundException("Guardian not found");
        }
    }


    @Override
    @Transactional(readOnly = true)
    public GuardianCreateDTO findGuardianById(String id) {
        logger.info("Buscando guardian por id: {}", id);
        return memberRepository.findById(id)
                .filter(this::isGuardian)
                .map(this::convertToGuardianDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuardianCreateDTO> findGuardiansByStatus(boolean active) {
        logger.info("Buscando guardians por estado: {}", active);
        return memberRepository.findByIsActive(active).stream()
                .filter(this::isGuardian)
                .map(this::convertToGuardianDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberDTO> findMembersInChargeOf(String guardianId) {
        logger.info("Buscando miembros a cargo del guardian: {}", guardianId);
        List<MemberCustom> membersCustom = memberRepository.findMembersImInChargeOf(guardianId);
        return membersCustom.stream()
                .map(this::convertMemberCustomToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GuardianWIthMemberDTO findGuardianWithMembers(String guardianId) {
        logger.info("Buscando guardian con sus miembros: {}", guardianId);
        java.lang.reflect.Member guardian = memberRepository.findById(guardianId)
                .filter(this::isGuardian)
                .orElse(null);

        if (guardian != null) {
            List<MemberDTO> membersInCharge = findMembersInChargeOf(guardianId);
            return GuardianMapper.toDTO(guardian, membersInCharge);
        }
        return null;
    }

    // TODO: create a method that validates if the member is a guardian, if a guardian exists
    // if not exists let the user continue with the operation and persist the guardian
    @Override
    @Transactional
    public GuardianCreateDTO saveGuardian(GuardianCreateDTO guardianCreateDTO) {
        logger.info("Creando nuevo guardian");
        Member guardian = convertToGuardianEntity(guardianCreateDTO);
        guardian.setRole("GUARDIAN");

        if (guardianCreateDTO.getMemberIdsInCharge() != null) {
            List<Integer> memberIds = guardianCreateDTO.getMemberIdsInCharge().stream()
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
            guardian.setInChargeOf(memberIds);
        }

        Member savedGuardian = memberRepository.save(guardian);
        logger.info("Guardian creado con ID: {}", savedGuardian.getUserId());
        return convertToGuardianDTO(savedGuardian);
    }

    // TODO: There should be two update methods, one for updating guardian info and that's it and another for updating guardian and members the guardian is in charge of in the same flow this method only meets the first requirement
    @Override
    @Transactional
    public GuardianCreateDTO updateGuardianById(String guardianId, GuardianCreateDTO guardianCreateDTO) {
        Member existingGuardian = memberRepository.findById(guardianId).orElse(null);
        if (existingGuardian != null && isGuardian(existingGuardian)) {
            updateGuardianFields(existingGuardian, guardianCreateDTO);
            Member savedGuardian = memberRepository.save(existingGuardian);
            logger.info("Guardian {} actualizado", guardianId);
            return convertToGuardianDTO(savedGuardian);
        } else {
            logger.warn("Guardian con ID {} no encontrado", guardianId);
            return null;
        }
    }

    // TODO: you gotta set the guardianId value in the column guardianId in the member table
    // validate if the guardian exists and if the member exists and also validate if the member is not a guardian
    @Override
    @Transactional
    public GuardianCreateDTO addMemberToGuardian(String guardianId, String memberId) {
        Member guardian = memberRepository.findById(guardianId).orElse(null);
        Member memberToAdd = memberRepository.findById(memberId).orElse(null);

        if (guardian != null && isGuardian(guardian) && memberToAdd != null && !isGuardian(memberToAdd)) {
            List<Integer> inChargeOf = guardian.getInChargeOf();
            if (inChargeOf == null) {
                inChargeOf = new ArrayList<>();
            }

            Integer memberIdInt = Integer.parseInt(memberId);
            if (!inChargeOf.contains(memberIdInt)) {
                inChargeOf.add(memberIdInt);
                guardian.setInChargeOf(inChargeOf);
                Member savedGuardian = memberRepository.save(guardian);
                logger.info("Miembro {} añadido al guardian {}", memberId, guardianId);
                return convertToGuardianDTO(savedGuardian);
            }
        }
        logger.warn("No se pudo añadir el miembro {} al guardian {}", memberId, guardianId);
        return null;
    }

    // TODO: To delete a member from guardian you gotta capture the memberId and remove the value in the guardianId column in the member table, and also you have to check if the guardian exists
    @Transactional
    public GuardianCreateDTO removeMemberFromGuardian(String guardianId, String memberId) {
        return null;
    }

    // TODO: To delete a guardian you gotta delete all the members that are in charge of that guardian
    // you can do it with a cascade delete or manually deleting each member
    // also you have to check if the guardian exists
    @Override
    @Transactional
    public boolean deleteGuardianById(String guardianId) {
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberDTO> findAvailableMembers() {
        logger.info("Buscando miembros disponibles para asignar a guardian");
        return memberRepository.findAll().stream()
                .filter(member -> !isGuardian(member))
                .map(this::convertToMemberSummaryDTO)
                .collect(Collectors.toList());
    }

    private MemberDTO convertMemberCustomToDTO(MemberCustom memberCustom) {
        return MemberDTO.builder()
                .memberId(memberCustom.getMemberId())
                .firstName(memberCustom.getFirstName())
                .lastName(memberCustom.getLastName())
                .gender(memberCustom.getGender())
                .phone(memberCustom.getPhone())
                .birthDate(memberCustom.getBirthDate())
                .build();
    }



}