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
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.repository.IMemberRepository;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;
import uao.edu.co.scouts_project.organigrama.repository.SubgroupRepository;

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
    private SubgroupRepository subgroupRepository;

    @Override
    public Member create_member(Member miembro) {
        validateMemberData(miembro);

        try {
            Optional<Member> existingMember = memberRepository.findByIdentification(miembro.getIdentification());
            if (existingMember.isPresent()) {
                log.warn("Attempt to create duplicate member with identification: {}", miembro.getIdentification());
                throw new IllegalArgumentException("A member with identification " + miembro.getIdentification() + " already exists");
            }

            Subgroup subgroup = subgroupRepository.findBySubgroupId(miembro.getSubgroup().getSubgroupId())
                    .orElseThrow(() -> new RuntimeException("Subgroup no encontrado"));

            miembro.setSubgroup(subgroup);

            String userId = SecurityContextHolder.getContext().getAuthentication().getName();
            log.info("Creating member - Authenticated user: {}", userId);


            miembro.setUserId(userId);

            if (miembro.getStatus() == null) {
                miembro.setStatus(Status.PENDING);
            }

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

    @Override
    @Transactional(readOnly = true)
    public List<Member> list_members() {
        List<Member> members = memberRepository.findAllWithSubgroup();
        log.info("Retrieved {} members from database", members.size());
        return members.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(Member::getLastName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                        .thenComparing(Member::getFirstName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Member> get_member_by_id(Long memberId) {
        if (memberId == null || memberId <= 0) {
            log.warn("Invalid member ID for search: {}", memberId);
            return Optional.empty();
        }

        Optional<Member> maybeMember = memberRepository.findByIdWithSubgroup(memberId);

        if (maybeMember.isPresent()) {
            Member m = maybeMember.get();
            if (m.getFirstName() == null || m.getLastName() == null) {
                log.warn("Member found (id={}) with incomplete data", memberId);
            } else {
                log.info("Member found: id={}, firstname={}, lastname={}", memberId, m.getFirstName(), m.getLastName());
            }
        } else {
            log.info("Member not found: id={}", memberId);
        }

        return maybeMember;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Member> list_members_by_status(String status) {
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

        List<Member> members = memberRepository.findByStatusWithSubgroup(enumStatus);

        return members.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(Member::getLastName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                        .thenComparing(Member::getFirstName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .collect(Collectors.toList());
    }

    @Override
    public Boolean update_status(Long memberId, Status enumStatus) {
        if (memberId == null || memberId <= 0) {
            log.warn("Invalid member ID for status update: {}", memberId);
            throw new IllegalArgumentException("Invalid member ID: " + memberId);
        }

        if (enumStatus == null) {
            log.warn("Null status provided for member ID: {}", memberId);
            throw new IllegalArgumentException("Status cannot be null");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> {
                    log.warn("Attempt to update status for non-existent member with ID: {}", memberId);
                    return new IllegalArgumentException("Member not found with ID: " + memberId);
                });

        if (member.getStatus() == enumStatus) {
            log.info("Member {} already has status {}", memberId, enumStatus);
            return false;
        }

        member.setStatus(enumStatus);

        switch (enumStatus) {
            case APPROVED -> {
                log.info("Member {} approved", memberId);
                member.setAcceptanceDate(LocalDate.now());
            }
            case REJECTED, PENDING -> {
                log.info("Member {} status changed to {}", memberId, enumStatus);
                member.setAcceptanceDate(null);
            }
        }

        memberRepository.save(member);
        log.info("Member {} status updated to {}", memberId, enumStatus);
        return true;
    }


    @Override
    public Member update_member_by_id(Long memberId, Member memberUpdate) {
        if (memberId == null || memberId <= 0) {
            log.warn("Attempt to update with invalid ID: {}", memberId);
            throw new IllegalArgumentException("Invalid member ID: " + memberId);
        }

        Member existingMember = memberRepository.findById(memberId)
                .orElseThrow(() -> {
                    log.warn("Attempt to update non-existent member with ID: {}", memberId);
                    return new IllegalArgumentException("Member not found with ID: " + memberId);
                });

        log.info("Starting update for member with ID: {}", memberId);

        BeanUtils.copyProperties(memberUpdate, existingMember, getNullPropertyNames(memberUpdate));
        existingMember.setMemberId(memberId);

        Member updatedMember = memberRepository.save(existingMember);
        log.info("Member updated successfully with ID: {}", memberId);
        return updatedMember;
    }



    /**
     * Valida que los datos obligatorios del miembro estén presentes
     */
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

    /**
     * Returns the names of null properties in an object (to ignore them in copyProperties)
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

        // Siempre ignorar estos campos del sistema
        emptyNames.add("memberId");
        emptyNames.add("userId");
        emptyNames.add("createdAt");

        return emptyNames.toArray(new String[0]);
    }
}