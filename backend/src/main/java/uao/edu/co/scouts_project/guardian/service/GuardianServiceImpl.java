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
                .orElseThrow(() -> new MemberNotFoundException("Miembro con ID " + memberId + " no encontrado"));
    
        if (member.getAge() == null || member.getAge() < 18) {
            throw new IllegalArgumentException("Solo se pueden remover miembros mayores de 18 años. El miembro tiene " + 
                                             (member.getAge() != null ? member.getAge() : "edad desconocida") + " años.");
        }
    
        log.info("Removiendo miembro {} (edad: {} años) del guardian {}", memberId, member.getAge(), guardianId);
        
        member.setGuardianId(null);
        memberRepository.save(member);
    }

    @Override
    @Transactional
    public boolean reassignMemberGuardian(Long memberId, Long currentGuardianId, Long newGuardianId) {
        log.info("Iniciando reasignación: miembro {} del guardian {} al guardian {}", 
                 memberId, currentGuardianId, newGuardianId);
        
        if (!memberRepository.findValidGuardianById(currentGuardianId).isPresent()) {
            throw new GuardianNotFoundException("Guardian actual con ID " + currentGuardianId + " no encontrado");
        }
        
        if (!memberRepository.findValidGuardianById(newGuardianId).isPresent()) {
            throw new GuardianNotFoundException("Nuevo guardian con ID " + newGuardianId + " no encontrado");
        }
        
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new MemberNotFoundException("Miembro con ID " + memberId + " no encontrado"));
        
        if (member.getGuardianId() == null || !member.getGuardianId().equals(currentGuardianId.intValue())) {
            throw new InvalidGuardianException("El miembro " + memberId + " no pertenece al guardian " + currentGuardianId);
        }
        
        int updatedRows = memberRepository.reassignMemberGuardian(memberId, currentGuardianId, newGuardianId);
        
        log.info("Reasignación completada. Filas actualizadas: {}", updatedRows);
        
        return updatedRows > 0;
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
        updateIfNotNull(dto.getFirstName(), existingGuardian::setFirstName);
        updateIfNotNull(dto.getLastName(), existingGuardian::setLastName);
        updateIfNotNull(dto.getAge(), existingGuardian::setAge);
        updateIfNotNull(dto.getSubgroup(), subgroup -> existingGuardian.setSubgroup(SubgroupMapper.toEntity(subgroup)));
        updateIfNotNull(dto.getPhone(), existingGuardian::setPhone);
        updateIfNotNull(dto.getRelationship(), existingGuardian::setRelationship);
        updateIfNotNull(dto.getIdentification(), existingGuardian::setIdentification);
        updateIfNotNull(dto.getDocumentType(), existingGuardian::setDocumentType);
        updateIfNotNull(dto.getAddress(), existingGuardian::setAddress);
        updateIfNotNull(dto.getIsActive(), existingGuardian::setIsActive);
        updateIfNotNull(dto.getStatus(), existingGuardian::setStatus);
        updateIfNotNull(dto.getAcceptanceDate(), existingGuardian::setAcceptanceDate);
    }

    private <T> void updateIfNotNull(T value, java.util.function.Consumer<T> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }

}