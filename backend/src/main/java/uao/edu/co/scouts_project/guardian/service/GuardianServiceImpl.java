package uao.edu.co.scouts_project.guardian.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.AvailableGuardianDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianCreateResponse;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWithMembersDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.*;
import uao.edu.co.scouts_project.guardian.mapper.GuardianMapper;
import uao.edu.co.scouts_project.guardian.mapper.SubgroupMapper;
import uao.edu.co.scouts_project.guardian.model.AvailableGuardian;
import uao.edu.co.scouts_project.guardian.model.MemberCustom;
import uao.edu.co.scouts_project.guardian.repository.GuardianRepository;
import uao.edu.co.scouts_project.member.model.Member;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GuardianServiceImpl implements GuardianService {

    private final GuardianRepository memberRepository;

    public GuardianServiceImpl(GuardianRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public GuardianCreateDTO findGuardianById(Long id) {
        Member member = memberRepository.findValidGuardianById(id)
                .orElseThrow(() -> new MemberNotFoundException("Member with ID " + id + " not found"));

        return GuardianMapper.toGuardianDTO(member);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MemberDTO> findMembersInChargeOf(Long guardianId) {

        List<MemberCustom> membersCustom = this.memberRepository.findMembersInChargeOf(guardianId);
        if (membersCustom.isEmpty()) {
            throw new MemberNotFoundException("No members were found for the requested guardian");
        }

        return membersCustom.stream()
                .map(GuardianMapper::toMemberDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GuardianWithMembersDTO findGuardianWithMembers(Long guardianId) {
        List<MemberDTO> membersInCharge = this.findMembersInChargeOf(guardianId);
        GuardianCreateDTO guardian = this.findGuardianById(guardianId);

        return GuardianWithMembersDTO.builder()
                .memberId(guardianId)
                .userId(guardian.getUserId())
                .tenantId(guardian.getTenantId())
                .subgroup(guardian.getSubgroup())
                .firstName(guardian.getFirstName())
                .lastName(guardian.getLastName())
                .age(guardian.getAge())
                .identification(guardian.getIdentification())
                .documentType(guardian.getDocumentType())
                .phone(guardian.getPhone())
                .isActive(guardian.getIsActive())
                .relationship(guardian.getRelationship())
                .status(guardian.getStatus())
                .acceptanceDate(guardian.getAcceptanceDate())
                .members(membersInCharge)
                .build();

    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailableGuardianDTO> findAvailableGuardians() {
        List<AvailableGuardian> availableGuardians = memberRepository.findAvailableGuardians();

        if (availableGuardians.isEmpty()) {
            throw new AvailableGuardiansException("No available guardians found");
        }

        return availableGuardians.stream()
                .map(model -> AvailableGuardianDTO.builder()
                    .memberId(model.getMemberId())
                    .firstName(model.getFirstName())
                    .lastName(model.getLastName())
                    .identification(model.getIdentification())
                    .build())
                .toList();
    }

    @Override
    @Transactional
    public GuardianCreateResponse saveGuardian(GuardianCreateDTO guardianCreateDTO) {
        if (memberRepository.existsByValidGuardianIdentification(guardianCreateDTO.getIdentification())) {
            throw new MemberAlreadyAssignedException("Guardian with identification already exists");
        }

        Member saved = memberRepository.save(GuardianMapper.toEntity(guardianCreateDTO));
        return new GuardianCreateResponse(saved.getMemberId());
    }

    @Override
    @Transactional
    public void updateGuardianById(Long guardianId, GuardianCreateDTO guardianCreateDTO) {
        Member existingGuardian = memberRepository.findValidGuardianById(guardianId)
                .orElseThrow(
                        () -> new GuardianNotFoundException("Valid guardian with ID " + guardianId + " not found"));

        updateGuardianFields(existingGuardian, guardianCreateDTO);
        memberRepository.save(existingGuardian);

    }

        // AGREGAR ESTE MÉTODO A LA CLASE GuardianServiceImpl:
    @Override
    @Transactional(readOnly = true)
    public List<MemberDTO> findMembersWithoutGuardian() {
        List<MemberCustom> membersCustom = this.memberRepository.findMembersWithoutGuardian();
        
        if (membersCustom.isEmpty()) {
            return new ArrayList<>();
        }
    
        return membersCustom.stream()
                .map(GuardianMapper::toMemberDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addMemberToGuardian(Long guardianId, Long memberId) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberNotFoundException("Miembro con ID " + memberId + " no encontrado"));

        Member guardianToAdd = memberRepository.findById(guardianId)
                .orElseThrow(() -> new GuardianNotFoundException("Guardian con ID " + guardianId + " no encontrado"));

        member.setGuardianId(guardianToAdd.getMemberId().intValue());
        memberRepository.save(member);
    }

    @Override
    @Transactional
    public void removeGuardianIdFromMember(Long guardianId, Long memberId) {

        boolean guardianExists = memberRepository.existsById(guardianId);

        if (!guardianExists) {
            throw new GuardianNotFoundException("Guardian con ID " + guardianId + " no encontrado");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberNotFoundException("Not found"));

        member.setGuardianId(null);
        memberRepository.save(member);
    }

    @Override
    @Transactional
    public void deleteGuardianById(Long guardianId) {

        if (!memberRepository.existsById(guardianId)) {
            throw new GuardianNotFoundException("Not found");
        }

        memberRepository.removeGuardianIdFromMembers(guardianId);
        memberRepository.deleteGuardianById(guardianId);
    }

    private void updateGuardianFields(Member existingGuardian, GuardianCreateDTO dto) {
        existingGuardian.setFirstName(dto.getFirstName());
        existingGuardian.setLastName(dto.getLastName());
        existingGuardian.setAge(dto.getAge());
        existingGuardian.setSubgroup(SubgroupMapper.toEntity(dto.getSubgroup()));
        existingGuardian.setPhone(dto.getPhone());
        existingGuardian.setRelationship(dto.getRelationship());
    }

}