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

        //TODO:Add the exception folder
        @Override
        @Transactional(readOnly = true)
        public List<GuardianCreateDTO> findAllGuardians() {
            logger.info("Listando todos los guardians");
            List<GuardianCreateDTO> guardians = memberRepository.findAll().stream()
                    .filter(this::isGuardian)
                    .map(this::convertToGuardianDTO)
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

            return convertToGuardianDTO(member);
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

            validateGuardianExists(guardianId);

            Integer guardianIdInt = Integer.parseInt(guardianId);
            List<MemberCustom> membersCustom = memberRepository.findMembersImInChargeOf(guardianIdInt);

            return membersCustom.stream()
                    .map(this::convertMemberCustomToDTO)
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
            // Cambiar por el valor correcto del enum Role
            guardian.setRole(getRoleForGuardian());

            Member savedGuardian = memberRepository.save(guardian);
            logger.info("Guardian creado con ID: {}", savedGuardian.getUserId());
            return convertToGuardianDTO(savedGuardian);
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

            return convertToGuardianDTO(savedGuardian);
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

            return convertToGuardianDTO(guardian);
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

            return convertToGuardianDTO(guardian);
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
                    .map(this::convertToMemberSummaryDTO)
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

        //TODO:Add the existent role for guardian in your Role enum and change the return value of this method
        private Role getRoleForGuardian() {
            // Cambia por el valor correcto de tu enum Role
            // Ejemplos posibles: Role.PARENT, Role.TUTOR, Role.GUARDIAN_ROLE, etc.
            return Role.USER; // TEMPORAL - reemplaza con el valor correcto
        }

        //TODO: I need a hand with the mapper
        private GuardianCreateDTO convertToGuardianDTO(java.lang.reflect.Member member) {
            return GuardianMapper.toGuardianCreateDTO(member);
        }

        private MemberDTO convertToMemberSummaryDTO(java.lang.reflect.Member member) {
            return GuardianMapper.toMemberDTO(member);
        }

        private MemberDTO convertMemberCustomToDTO(MemberCustom memberCustom) {
            return GuardianMapper.toMemberDTO(memberCustom);
        }

        private MemberDTO convertMemberCustomToDTO(MemberCustom memberCustom) {
            return MemberDTO.builder()
                    .userId(memberCustom.getMemberId().toString())  // Convertir Long a String
                    .firstName(memberCustom.getFirstName())
                    .lastName(memberCustom.getLastName())
                    .gender(memberCustom.getGender())
                    .phone(memberCustom.getPhone())
                    .birthDate(memberCustom.getBirthDate())
                    .build();
        }
    }

    //TODO:Si algo el servicesImpl que estaba antes esta en servicesImpl_1.java