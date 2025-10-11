package uao.edu.co.scouts_project.guardian;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;


import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWIthMemberDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.GuardianNotFoundException;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.InvalidGuardianException;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.MemberAlreadyAssignedException;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.MemberNotFoundException;
import uao.edu.co.scouts_project.guardian.model.Member;
import uao.edu.co.scouts_project.guardian.model.MemberCustom;
import uao.edu.co.scouts_project.guardian.repository.GuardianRepository;
import uao.edu.co.scouts_project.guardian.service.GuardianServiceImpl;
import uao.edu.co.scouts_project.guardian.shared.enums.DocumentType;
import uao.edu.co.scouts_project.guardian.shared.enums.Status;
import uao.edu.co.scouts_project.infrastructure.security.Role;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;

@ExtendWith(MockitoExtension.class)
class GuadianServiceImplTest {

    @Mock
    private GuardianRepository guardianRepository;

    @InjectMocks
    private GuardianServiceImpl guardianService;

    private Member guardianMember;
    private Member regularMember;
    private GuardianCreateDTO guardianCreateDTO;
    private MemberCustom memberCustom;
    private Subgroup subgroup;

    @BeforeEach
    void setUp() {
        // Setup Subgroup
        subgroup = Subgroup.builder()
                .subgroupId(1L)
                .name("Test Subgroup")
                .build();

        // Setup Guardian Member
        guardianMember = Member.builder()
                .memberId(1L)
                .userId("guardian-123")
                .tenantId("tenant-1")
                .firstName("John")
                .lastName("Doe")
                .age(35)
                .role(Role.ACUDIENTE)
                .identification("1234567890")
                .documentType(DocumentType.CC)
                .phone("3001234567")
                .isActive(true)
                .relationship("Father")
                .status(Status.APPROVED)
                .acceptanceDate(LocalDate.now())
                .subgroup(subgroup)
                .build();

        // Setup Regular Member
        regularMember = Member.builder()
                .memberId(2L)
                .userId("member-456")
                .tenantId("tenant-1")
                .firstName("Jane")
                .lastName("Smith")
                .age(10)
                .role(Role.SCOUT)
                .identification("9876543210")
                .documentType(DocumentType.TI)
                .phone("3009876543")
                .isActive(true)
                .status(Status.APPROVED)
                .acceptanceDate(LocalDate.now())
                .guardianId(null)
                .subgroup(subgroup)
                .build();

        // Setup GuardianCreateDTO
        guardianCreateDTO = GuardianCreateDTO.builder()
                .userId("guardian-123")
                .tenantId("tenant-1")
                .firstName("John")
                .lastName("Doe")
                .age(35)
                .identification("1234567890")
                .documentType(DocumentType.CC)
                .phone("3001234567")
                .isActive(true)
                .relationship("Father")
                .status(Status.APPROVED)
                .acceptanceDate(LocalDate.now())
                .roles(List.of(Role.ACUDIENTE))
                .build();

        // Setup MemberCustom
        memberCustom = new MemberCustom(
                2L,
                "Jane",
                "Smith",
                "FEMALE",
                "3009876543",
                LocalDate.of(2013, 5, 15));
    }

    @Nested
    @DisplayName("findAllGuardians Tests")
    class FindAllGuardiansTests {

        @Test
        @DisplayName("Should return all guardians when guardians exist")
        void shouldReturnAllGuardians() {
            // Arrange
            List<Member> members = Arrays.asList(guardianMember, regularMember);
            when(guardianRepository.findAll()).thenReturn(members);

            // Act
            List<GuardianCreateDTO> result = guardianService.findAllGuardians();

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("guardian-123", result.get(0).getUserId());
            verify(guardianRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no guardians exist")
        void shouldReturnEmptyListWhenNoGuardians() {
            // Arrange
            when(guardianRepository.findAll()).thenReturn(Collections.emptyList());

            // Act
            List<GuardianCreateDTO> result = guardianService.findAllGuardians();

            // Assert
            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(guardianRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should filter out non-guardian members")
        void shouldFilterOutNonGuardians() {
            // Arrange
            List<Member> members = Arrays.asList(regularMember);
            when(guardianRepository.findAll()).thenReturn(members);

            // Act
            List<GuardianCreateDTO> result = guardianService.findAllGuardians();

            // Assert
            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(guardianRepository, times(1)).findAll();
        }
    }

    @Nested
    @DisplayName("findGuardianById Tests")
    class FindGuardianByIdTests {

        @Test
        @DisplayName("Should return guardian when found and is valid guardian")
        void shouldReturnGuardianWhenFound() {
            // Arrange
            when(guardianRepository.findById("guardian-123")).thenReturn(Optional.of(guardianMember));

            // Act
            GuardianCreateDTO result = guardianService.findGuardianById("guardian-123");

            // Assert
            assertNotNull(result);
            assertEquals("guardian-123", result.getUserId());
            assertEquals("John", result.getFirstName());
            verify(guardianRepository, times(1)).findById("guardian-123");
        }

        @Test
        @DisplayName("Should throw MemberNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            when(guardianRepository.findById("nonexistent")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(MemberNotFoundException.class,
                    () -> guardianService.findGuardianById("nonexistent"));
            verify(guardianRepository, times(1)).findById("nonexistent");
        }

        @Test
        @DisplayName("Should throw InvalidGuardianException when member is not a guardian")
        void shouldThrowExceptionWhenNotGuardian() {
            // Arrange
            when(guardianRepository.findById("member-456")).thenReturn(Optional.of(regularMember));

            // Act & Assert
            assertThrows(InvalidGuardianException.class,
                    () -> guardianService.findGuardianById("member-456"));
            verify(guardianRepository, times(1)).findById("member-456");
        }
    }

    @Nested
    @DisplayName("findGuardiansByStatus Tests")
    class FindGuardiansByStatusTests {

        @Test
        @DisplayName("Should return active guardians when status is true")
        void shouldReturnActiveGuardians() {
            // Arrange
            List<Member> activeMembers = Arrays.asList(guardianMember);
            when(guardianRepository.findByIsActive(true)).thenReturn(activeMembers);

            // Act
            List<GuardianCreateDTO> result = guardianService.findGuardiansByStatus(true);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertTrue(result.get(0).getIsActive());
            verify(guardianRepository, times(1)).findByIsActive(true);
        }

        @Test
        @DisplayName("Should return inactive guardians when status is false")
        void shouldReturnInactiveGuardians() {
            // Arrange
            guardianMember.setIsActive(false);
            List<Member> inactiveMembers = Arrays.asList(guardianMember);
            when(guardianRepository.findByIsActive(false)).thenReturn(inactiveMembers);

            // Act
            List<GuardianCreateDTO> result = guardianService.findGuardiansByStatus(false);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertFalse(result.get(0).getIsActive());
            verify(guardianRepository, times(1)).findByIsActive(false);
        }
    }

    @Nested
    @DisplayName("findMembersInChargeOf Tests")
    class FindMembersInChargeOfTests {

        @Test
        @DisplayName("Should return members in charge of guardian")
        void shouldReturnMembersInChargeOf() {
            // Arrange
            when(guardianRepository.findById("1")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findMembersImInChargeOf(1)).thenReturn(Arrays.asList(memberCustom));

            // Act
            List<MemberDTO> result = guardianService.findMembersInChargeOf("1");

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Jane", result.get(0).getFirstName());
            verify(guardianRepository, times(1)).findById("1");
            verify(guardianRepository, times(1)).findMembersImInChargeOf(1);
        }

        @Test
        @DisplayName("Should throw GuardianNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            when(guardianRepository.findById("nonexistent")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(GuardianNotFoundException.class,
                    () -> guardianService.findMembersInChargeOf("nonexistent"));
            verify(guardianRepository, times(1)).findById("nonexistent");
        }

        @Test
        @DisplayName("Should return empty list when guardian has no members")
        void shouldReturnEmptyListWhenNoMembers() {
            // Arrange
            when(guardianRepository.findById("1")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findMembersImInChargeOf(1)).thenReturn(Collections.emptyList());

            // Act
            List<MemberDTO> result = guardianService.findMembersInChargeOf("1");

            // Assert
            assertNotNull(result);
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("findGuardianWithMembers Tests")
    class FindGuardianWithMembersTests {

        @Test
        @DisplayName("Should return guardian with members")
        void shouldReturnGuardianWithMembers() {
            // Arrange
            when(guardianRepository.findById("1")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findMembersImInChargeOf(1)).thenReturn(Arrays.asList(memberCustom));

            // Act
            GuardianWIthMemberDTO result = guardianService.findGuardianWithMembers("1");

            // Assert
            assertNotNull(result);
            assertEquals("guardian-123", result.getUserId());
            assertNotNull(result.getMembers());
            assertEquals(1, result.getMembers().size());
        }

        @Test
        @DisplayName("Should throw GuardianNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            when(guardianRepository.findById("nonexistent")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(GuardianNotFoundException.class,
                    () -> guardianService.findGuardianWithMembers("nonexistent"));
        }
    }

    @Nested
    @DisplayName("saveGuardian Tests")
    class SaveGuardianTests {

        @Test
        @DisplayName("Should save new guardian successfully")
        void shouldSaveNewGuardian() {
            // Arrange
            when(guardianRepository.findById("guardian-123")).thenReturn(Optional.empty());
            when(guardianRepository.save(any(Member.class))).thenReturn(guardianMember);

            // Act
            GuardianCreateDTO result = guardianService.saveGuardian(guardianCreateDTO);

            // Assert
            assertNotNull(result);
            assertEquals("guardian-123", result.getUserId());
            assertEquals("John", result.getFirstName());
            verify(guardianRepository, times(1)).findById("guardian-123");
            verify(guardianRepository, times(1)).save(any(Member.class));
        }

        @Test
        @DisplayName("Should throw InvalidGuardianException when guardian already exists")
        void shouldThrowExceptionWhenGuardianExists() {
            // Arrange
            when(guardianRepository.findById("guardian-123")).thenReturn(Optional.of(guardianMember));

            // Act & Assert
            assertThrows(InvalidGuardianException.class,
                    () -> guardianService.saveGuardian(guardianCreateDTO));
            verify(guardianRepository, times(1)).findById("guardian-123");
            verify(guardianRepository, never()).save(any(Member.class));
        }
    }

    @Nested
    @DisplayName("updateGuardianById Tests")
    class UpdateGuardianByIdTests {

        @Test
        @DisplayName("Should update guardian successfully")
        void shouldUpdateGuardian() {
            // Arrange
            GuardianCreateDTO updateDTO = GuardianCreateDTO.builder()
                    .firstName("John Updated")
                    .lastName("Doe Updated")
                    .age(36)
                    .identification("1234567890")
                    .documentType(DocumentType.CC)
                    .phone("3001111111")
                    .isActive(true)
                    .relationship("Father")
                    .status(Status.APPROVED)
                    .acceptanceDate(LocalDate.now())
                    .build();

            when(guardianRepository.findById("guardian-123")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.save(any(Member.class))).thenReturn(guardianMember);

            // Act
            GuardianCreateDTO result = guardianService.updateGuardianById("guardian-123", updateDTO);

            // Assert
            assertNotNull(result);
            verify(guardianRepository, times(1)).findById("guardian-123");
            verify(guardianRepository, times(1)).save(any(Member.class));
        }

        @Test
        @DisplayName("Should throw GuardianNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            when(guardianRepository.findById("nonexistent")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(GuardianNotFoundException.class,
                    () -> guardianService.updateGuardianById("nonexistent", guardianCreateDTO));
            verify(guardianRepository, times(1)).findById("nonexistent");
            verify(guardianRepository, never()).save(any(Member.class));
        }

        @Test
        @DisplayName("Should throw InvalidGuardianException when member is not a guardian")
        void shouldThrowExceptionWhenNotGuardian() {
            // Arrange
            when(guardianRepository.findById("member-456")).thenReturn(Optional.of(regularMember));

            // Act & Assert
            assertThrows(InvalidGuardianException.class,
                    () -> guardianService.updateGuardianById("member-456", guardianCreateDTO));
            verify(guardianRepository, times(1)).findById("member-456");
            verify(guardianRepository, never()).save(any(Member.class));
        }
    }

    @Nested
    @DisplayName("addMemberToGuardian Tests")
    class AddMemberToGuardianTests {

        @Test
        @DisplayName("Should add member to guardian successfully")
        void shouldAddMemberToGuardian() {
            // Arrange
            when(guardianRepository.findById("1")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findById("member-456")).thenReturn(Optional.of(regularMember));
            when(guardianRepository.save(any(Member.class))).thenReturn(regularMember);

            // Act
            GuardianCreateDTO result = guardianService.addMemberToGuardian("1", "member-456");

            // Assert
            assertNotNull(result);
            verify(guardianRepository, times(2)).findById(anyString());
            verify(guardianRepository, times(1)).save(any(Member.class));
        }

        @Test
        @DisplayName("Should throw GuardianNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            when(guardianRepository.findById("nonexistent")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(GuardianNotFoundException.class,
                    () -> guardianService.addMemberToGuardian("nonexistent", "member-456"));
        }

        @Test
        @DisplayName("Should throw MemberNotFoundException when member not found")
        void shouldThrowExceptionWhenMemberNotFound() {
            // Arrange
            when(guardianRepository.findById("guardian-123")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findById("nonexistent")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(MemberNotFoundException.class,
                    () -> guardianService.addMemberToGuardian("guardian-123", "nonexistent"));
        }

        @Test
        @DisplayName("Should throw InvalidGuardianException when trying to add guardian as member")
        void shouldThrowExceptionWhenAddingGuardianAsMember() {
            // Arrange
            Member anotherGuardian = Member.builder()
                    .userId("guardian-789")
                    .role(Role.ACUDIENTE)
                    .build();

            when(guardianRepository.findById("1")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findById("guardian-789")).thenReturn(Optional.of(anotherGuardian));

            // Act & Assert
            assertThrows(InvalidGuardianException.class,
                    () -> guardianService.addMemberToGuardian("1", "guardian-789"));
        }

        @Test
        @DisplayName("Should throw MemberAlreadyAssignedException when member already has guardian")
        void shouldThrowExceptionWhenMemberAlreadyAssigned() {
            // Arrange
            regularMember.setGuardianId(999);
            when(guardianRepository.findById("1")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findById("member-456")).thenReturn(Optional.of(regularMember));

            // Act & Assert
            assertThrows(MemberAlreadyAssignedException.class,
                    () -> guardianService.addMemberToGuardian("1", "member-456"));
        }
    }

    @Nested
    @DisplayName("removeMemberFromGuardian Tests")
    class RemoveMemberFromGuardianTests {

        @Test
        @DisplayName("Should remove member from guardian successfully")
        void shouldRemoveMemberFromGuardian() {
            // Arrange
            regularMember.setGuardianId(1);
            when(guardianRepository.findById("1")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findById("member-456")).thenReturn(Optional.of(regularMember));
            when(guardianRepository.save(any(Member.class))).thenReturn(regularMember);

            // Act
            GuardianCreateDTO result = guardianService.removeMemberFromGuardian("1", "member-456");

            // Assert
            assertNotNull(result);
            verify(guardianRepository, times(2)).findById(anyString());
            verify(guardianRepository, times(1)).save(any(Member.class));
        }

        @Test
        @DisplayName("Should throw GuardianNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            when(guardianRepository.findById("nonexistent")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(GuardianNotFoundException.class,
                    () -> guardianService.removeMemberFromGuardian("nonexistent", "member-456"));
        }

        @Test
        @DisplayName("Should throw MemberNotFoundException when member not found")
        void shouldThrowExceptionWhenMemberNotFound() {
            // Arrange
            when(guardianRepository.findById("guardian-123")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findById("nonexistent")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(MemberNotFoundException.class,
                    () -> guardianService.removeMemberFromGuardian("guardian-123", "nonexistent"));
        }

        @Test
        @DisplayName("Should throw InvalidGuardianException when member not assigned to this guardian")
        void shouldThrowExceptionWhenMemberNotAssignedToGuardian() {
            // Arrange
            regularMember.setGuardianId(999); // Different guardian
            when(guardianRepository.findById("1")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findById("member-456")).thenReturn(Optional.of(regularMember));

            // Act & Assert
            assertThrows(InvalidGuardianException.class,
                    () -> guardianService.removeMemberFromGuardian("1", "member-456"));
        }
    }

    @Nested
    @DisplayName("deleteGuardianById Tests")
    class DeleteGuardianByIdTests {

        @Test
        @DisplayName("Should delete guardian successfully")
        void shouldDeleteGuardian() {
            // Arrange
            when(guardianRepository.findById("1")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findAll()).thenReturn(Collections.emptyList());
            doNothing().when(guardianRepository).delete(any(Member.class));

            // Act
            boolean result = guardianService.deleteGuardianById("1");

            // Assert
            assertTrue(result);
            verify(guardianRepository, times(1)).findById("1");
            verify(guardianRepository, times(1)).delete(guardianMember);
        }

        @Test
        @DisplayName("Should delete guardian and remove references from members")
        void shouldDeleteGuardianAndRemoveReferences() {
            // Arrange
            regularMember.setGuardianId(1);
            Member anotherMember = Member.builder()
                    .memberId(3L)
                    .userId("member-789")
                    .role(Role.SCOUT)
                    .guardianId(1)
                    .build();

            when(guardianRepository.findById("1")).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findAll()).thenReturn(Arrays.asList(regularMember, anotherMember));
            when(guardianRepository.save(any(Member.class))).thenReturn(regularMember);
            doNothing().when(guardianRepository).delete(any(Member.class));

            // Act
            boolean result = guardianService.deleteGuardianById("1");

            // Assert
            assertTrue(result);
            verify(guardianRepository, times(1)).findById("1");
            verify(guardianRepository, times(2)).save(any(Member.class));
            verify(guardianRepository, times(1)).delete(guardianMember);
        }

        @Test
        @DisplayName("Should throw GuardianNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            when(guardianRepository.findById("nonexistent")).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(GuardianNotFoundException.class,
                    () -> guardianService.deleteGuardianById("nonexistent"));
            verify(guardianRepository, times(1)).findById("nonexistent");
            verify(guardianRepository, never()).delete(any(Member.class));
        }

        @Test
        @DisplayName("Should throw InvalidGuardianException when member is not a guardian")
        void shouldThrowExceptionWhenNotGuardian() {
            // Arrange
            when(guardianRepository.findById("member-456")).thenReturn(Optional.of(regularMember));

            // Act & Assert
            assertThrows(InvalidGuardianException.class,
                    () -> guardianService.deleteGuardianById("member-456"));
            verify(guardianRepository, times(1)).findById("member-456");
            verify(guardianRepository, never()).delete(any(Member.class));
        }
    }

    @Nested
    @DisplayName("findAvailableMembers Tests")
    class FindAvailableMembersTests {

        @Test
        @DisplayName("Should return available members without guardian")
        void shouldReturnAvailableMembers() {
            // Arrange
            Member availableMember1 = Member.builder()
                    .userId("member-1")
                    .role(Role.SCOUT)
                    .guardianId(null)
                    .firstName("Alice")
                    .lastName("Wonder")
                    .build();

            Member availableMember2 = Member.builder()
                    .userId("member-2")
                    .role(Role.SCOUT)
                    .guardianId(null)
                    .firstName("Bob")
                    .lastName("Builder")
                    .build();

            when(guardianRepository.findAll()).thenReturn(Arrays.asList(
                    guardianMember, availableMember1, availableMember2, regularMember));

            // Act
            List<MemberDTO> result = guardianService.findAvailableMembers();

            // Assert
            assertNotNull(result);
            assertEquals(3, result.size());
            verify(guardianRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no available members")
        void shouldReturnEmptyListWhenNoAvailableMembers() {
            // Arrange
            regularMember.setGuardianId(123);
            when(guardianRepository.findAll()).thenReturn(Arrays.asList(guardianMember, regularMember));

            // Act
            List<MemberDTO> result = guardianService.findAvailableMembers();

            // Assert
            assertNotNull(result);
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Should exclude guardians from available members")
        void shouldExcludeGuardiansFromAvailableMembers() {
            // Arrange
            Member anotherGuardian = Member.builder()
                    .userId("guardian-789")
                    .role(Role.ACUDIENTE)
                    .guardianId(null)
                    .build();

            when(guardianRepository.findAll()).thenReturn(Arrays.asList(
                    guardianMember, anotherGuardian, regularMember));

            // Act
            List<MemberDTO> result = guardianService.findAvailableMembers();

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("member-456", result.get(0).getUserId());
        }
    }
}
