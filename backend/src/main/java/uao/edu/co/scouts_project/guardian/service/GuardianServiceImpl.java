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
        Member guardian = memberRepository.findById(guardianId).orElse(null);

        if (guardian != null && isGuardian(guardian)) {
            List<Integer> inChargeOf = guardian.getInChargeOf();
            if (inChargeOf != null) {
                Integer memberIdInt = Integer.parseInt(memberId);
                inChargeOf.remove(memberIdInt);
                guardian.setInChargeOf(inChargeOf);
                Member savedGuardian = memberRepository.save(guardian);
                logger.info("Miembro {} removido del guardian {}", memberId, guardianId);
                return convertToGuardianDTO(savedGuardian);
            }
        }
        logger.warn("No se pudo remover el miembro {} del guardian {}", memberId, guardianId);
        return null;
    }

    @Override
    @Transactional
    public boolean deleteGuardianById(String guardianId) {
        Member guardian = memberRepository.findById(guardianId).orElse(null);

        if (guardian != null && isGuardian(guardian)) {
            // Eliminar en cascada los miembros a su cargo
            List<Integer> membersInCharge = guardian.getInChargeOf();
            if (membersInCharge != null) {
                for (Integer memberId : membersInCharge) {
                    memberRepository.deleteById(String.valueOf(memberId));
                    logger.info("Miembro {} eliminado en cascada", memberId);
                }
            }

        memberRepository.deleteById(guardianId);
            logger.info("Guardian {} eliminado con cascada", guardianId);
            return true;
        } else {
            logger.warn("Guardian con ID {} no encontrado", guardianId);
            return false;
        }
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


    private GuardianDTO convertToGuardianDTO(Member member) {
        List<MemberSummaryDTO> membersInCharge = new ArrayList<>();

        if (member.getInChargeOf() != null) {
            membersInCharge = member.getInChargeOf().stream()
                    .map(id -> memberRepository.findById(String.valueOf(id)).orElse(null))
                    .filter(m -> m != null)
                    .map(this::convertToMemberSummaryDTO)
                    .collect(Collectors.toList());
        }

        return GuardianDTO.builder()
                .userId(member.getUserId())
                .tenantId(member.getTenantId())
                .subgroupId(member.getSubgroup() != null ? member.getSubgroup().getId() : null)
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .age(member.getAge())
                .identification(member.getIdentification())
                .documentType(member.getDocumentType())
                .email(member.getEmail())
                .gender(member.getGender())
                .birthDate(member.getBirthDate())
                .address(member.getAddress())
                .phone(member.getPhone())
                .isActive(member.getIsActive())
                .relationship(member.getRelationship())
                .status(member.getStatus())
                .acceptanceDate(member.getAcceptanceDate())
                .membersInCharge(membersInCharge)
                .subgroupName(member.getSubgroup() != null ? member.getSubgroup().getName() : null)
                .build();
    }

    private MemberSummaryDTO convertToMemberSummaryDTO(Member member) {
        return MemberSummaryDTO.builder()
                .userId(member.getUserId())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .age(member.getAge())
                .role(member.getRole())
                .isActive(member.getIsActive())
                .build();
    }

    private Member convertToMemberEntity(MemberCreateDTO dto) {
        Subgroup subgroup = new Subgroup();
        subgroup.setId(dto.getSubgroupId());

        return Member.builder()
                .tenantId(dto.getTenantId())
                .subgroup(subgroup)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .age(dto.getAge())
                .role(dto.getRole())
                .identification(dto.getIdentification())
                .documentType(dto.getDocumentType())
                .email(dto.getEmail())
                .gender(dto.getGender())
                .birthDate(dto.getBirthDate())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .weight(dto.getWeight())
                .height(dto.getHeight())
                .hobbies(dto.getHobbies())
                .sports(dto.getSports())
                .instruments(dto.getInstruments())
                .isActive(dto.getIsActive())
                .relationship(dto.getRelationship())
                .status(dto.getStatus())
                .acceptanceDate(dto.getAcceptanceDate())
                .build();
    }

    private Member convertToGuardianEntity(GuardianCreateDTO dto) {
        Subgroup subgroup = new Subgroup();
        subgroup.setSubgroupId(dto.getSubgroupId());

        return Member.builder()
                .tenantId(dto.getTenantId())
                .subgroup(subgroup)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .age(dto.getAge())
                .role("GUARDIAN")
                .identification(dto.getIdentification())
                .documentType(dto.getDocumentType())
                .email(dto.getEmail())
                .gender(dto.getGender())
                .birthDate(dto.getBirthDate())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .isActive(dto.getIsActive())
                .relationship(dto.getRelationship())
                .status(dto.getStatus())
                .acceptanceDate(dto.getAcceptanceDate())
                .build();
    }

    private void updateMemberFields(Member member, MemberCreateDTO dto) {
        member.setFirstName(dto.getFirstName());
        member.setLastName(dto.getLastName());
        member.setAge(dto.getAge());
        member.setRole(dto.getRole());
        member.setEmail(dto.getEmail());
        member.setGender(dto.getGender());
        member.setBirthDate(dto.getBirthDate());
        member.setPhone(dto.getPhone());
        member.setIsActive(dto.getIsActive());
        member.setStatus(dto.getStatus());
    }

    private void updateGuardianFields(Member guardian, GuardianCreateDTO dto) {
        guardian.setFirstName(dto.getFirstName());
        guardian.setLastName(dto.getLastName());
        guardian.setAge(dto.getAge());
        guardian.setEmail(dto.getEmail());
        guardian.setGender(dto.getGender());
        guardian.setBirthDate(dto.getBirthDate());
        guardian.setPhone(dto.getPhone());
        guardian.setIsActive(dto.getIsActive());
        guardian.setRelationship(dto.getRelationship());
        guardian.setStatus(dto.getStatus());

        if (dto.getMemberIdsInCharge() != null) {
            List<Integer> memberIds = dto.getMemberIdsInCharge().stream()
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
            guardian.setInChargeOf(memberIds);
        }
    }
    private boolean isGuardian(Member member) {
        return "GUARDIAN".equals(member.getRole()) || "ACUDIENTE".equals(member.getRole());
    }
}