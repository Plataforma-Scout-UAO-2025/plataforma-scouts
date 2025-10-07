package uao.edu.co.scouts_project.guardian.service;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uao.edu.co.scouts_project.guardian.dto.*;
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

    
    @Override
    @Transactional(readOnly = true)
    public List<GuardianDTO> findAllGuardians() {
        logger.info("Listando todos los guardians");
        return memberRepository.findAll().stream()
                .filter(this::isGuardian).map(this::convertToGuardianDTO)
                                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GuardianDTO findGuardianById(String id) {
        logger.info("Buscando guardian por id: {}", id);
        return memberRepository.findById(id)
                .filter(this::isGuardian)
                .map(this::convertToGuardianDTO)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuardianDTO> findGuardiansByStatus(boolean active) {
        logger.info("Buscando guardians por estado: {}", active);
        return memberRepository.findByIsActive(active).stream()
                .filter(this::isGuardian)
                .map(this::convertToGuardianDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GuardianDTO saveGuardian(GuardianCreateDTO guardianCreateDTO) {
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

    @Override
    @Transactional
    public GuardianDTO updateGuardianById(String guardianId, GuardianCreateDTO guardianCreateDTO) {
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

    @Override
    @Transactional
    public GuardianDTO addMemberToGuardian(String guardianId, String memberId) {
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

    @Override
    @Transactional
    public GuardianDTO removeMemberFromGuardian(String guardianId, String memberId) {
        return null;
    }

    @Override
    @Transactional
    public boolean deleteGuardianById(String guardianId) {
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberSummaryDTO> findAvailableMembers() {
        logger.info("Buscando miembros disponibles para asignar a guardian");
        return memberRepository.findAll().stream()
                .filter(member -> !isGuardian(member))
                .map(this::convertToMemberSummaryDTO)
                .collect(Collectors.toList());
    }


    
}