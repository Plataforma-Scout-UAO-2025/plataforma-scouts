package uao.edu.co.scouts_project.member.guardian;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
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
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWithMembersDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.GuardianNotFoundException;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.MemberAlreadyAssignedException;
import uao.edu.co.scouts_project.guardian.exception.GuardianExceptions.MemberNotFoundException;
import uao.edu.co.scouts_project.guardian.model.MemberCustom;
import uao.edu.co.scouts_project.guardian.repository.GuardianRepository;
import uao.edu.co.scouts_project.guardian.service.GuardianServiceImpl;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import uao.edu.co.scouts_project.member.model.Member;
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
                .role("ACUDIENTE") // String, not enum
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
                .role("SCOUT") // String, not enum
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
                .rol("ACUDIENTE") // String, not enum
                .build();

        // Setup MemberCustom
        memberCustom = MemberCustom.builder()
                .firstName("Jane")
                .lastName("Smith")
                .identification("9876543210")
                .documentType(DocumentType.TI)
                .emergencyContacts(Collections.emptyList())
                .age(10)
                .gender("FEMALE")
                .phone("3009876543")
                .isActive(true)
                .birthDate(LocalDate.of(2013, 5, 15))
                .build();
    }

    @Nested
    @DisplayName("findGuardianById Tests")
    class FindGuardianByIdTests {

        @Test
        @DisplayName("Should return guardian when found and is valid guardian")
        void shouldReturnGuardianWhenFound() {
            // Arrange
            when(guardianRepository.findValidGuardianById(1L)).thenReturn(Optional.of(guardianMember));

            // Act
            GuardianCreateDTO result = guardianService.findGuardianById(1L);

            // Assert
            assertNotNull(result);
            assertEquals("guardian-123", result.getUserId());
            assertEquals("John", result.getFirstName());
            verify(guardianRepository, times(1)).findValidGuardianById(1L);
        }

        @Test
        @DisplayName("Should throw MemberNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            when(guardianRepository.findValidGuardianById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(MemberNotFoundException.class,
                    () -> guardianService.findGuardianById(999L));
            verify(guardianRepository, times(1)).findValidGuardianById(999L);
        }
    }

    @Nested
    @DisplayName("findMembersInChargeOf Tests")
    class FindMembersInChargeOfTests {

        @Test
        @DisplayName("Should return members in charge of guardian")
        void shouldReturnMembersInChargeOf() {
            // Arrange
            when(guardianRepository.findMembersInChargeOf(1L)).thenReturn(Arrays.asList(memberCustom));

            // Act
            List<MemberDTO> result = guardianService.findMembersInChargeOf(1L);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Jane", result.get(0).getFirstName());
            verify(guardianRepository, times(1)).findMembersInChargeOf(1L);
        }

        @Test
        @DisplayName("Should throw MemberNotFoundException when no members found")
        void shouldThrowExceptionWhenNoMembersFound() {
            // Arrange
            when(guardianRepository.findMembersInChargeOf(1L)).thenReturn(Collections.emptyList());

            // Act & Assert
            assertThrows(MemberNotFoundException.class,
                    () -> guardianService.findMembersInChargeOf(1L));
            verify(guardianRepository, times(1)).findMembersInChargeOf(1L);
        }
    }

    @Nested
    @DisplayName("findGuardianWithMembers Tests")
    class FindGuardianWithMembersTests {

        @Test
        @DisplayName("Should return guardian with members")
        void shouldReturnGuardianWithMembers() {
            // Arrange
            when(guardianRepository.findValidGuardianById(1L)).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findMembersInChargeOf(1L)).thenReturn(Arrays.asList(memberCustom));

            // Act
            GuardianWithMembersDTO result = guardianService.findGuardianWithMembers(1L);

            // Assert
            assertNotNull(result);
            assertEquals("guardian-123", result.getUserId());
            assertNotNull(result.getMembers());
            assertEquals(1, result.getMembers().size());
        }

        @Test
        @DisplayName("Should throw MemberNotFoundException when no members found")
        void shouldThrowExceptionWhenNoMembersFound() {
            // Arrange
            when(guardianRepository.findMembersInChargeOf(999L)).thenReturn(Collections.emptyList());

            // Act & Assert
            assertThrows(MemberNotFoundException.class,
                    () -> guardianService.findGuardianWithMembers(999L));
        }
    }

    @Nested
    @DisplayName("saveGuardian Tests")
    class SaveGuardianTests {

        @Test
        @DisplayName("Should save new guardian successfully and return response with ID")
        void shouldSaveNewGuardian() {
            // Arrange
            when(guardianRepository.existsByValidGuardianIdentification("1234567890")).thenReturn(false);
            when(guardianRepository.save(any(Member.class))).thenReturn(guardianMember);

            // Act
            var response = guardianService.saveGuardian(guardianCreateDTO);

            // Assert
            assertNotNull(response);
            assertNotNull(response.id());
            assertEquals(1L, response.id());
            verify(guardianRepository, times(1)).existsByValidGuardianIdentification("1234567890");
            verify(guardianRepository, times(1)).save(any(Member.class));
        }

        @Test
        @DisplayName("Should throw MemberAlreadyAssignedException when guardian already exists")
        void shouldThrowExceptionWhenGuardianExists() {
            // Arrange
            when(guardianRepository.existsByValidGuardianIdentification("1234567890")).thenReturn(true);

            // Act & Assert
            assertThrows(MemberAlreadyAssignedException.class,
                    () -> guardianService.saveGuardian(guardianCreateDTO));
            verify(guardianRepository, times(1)).existsByValidGuardianIdentification("1234567890");
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

            when(guardianRepository.findValidGuardianById(1L)).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.save(any(Member.class))).thenReturn(guardianMember);

            // Act & Assert
            assertDoesNotThrow(() -> guardianService.updateGuardianById(1L, updateDTO));

            verify(guardianRepository, times(1)).findValidGuardianById(1L);
            verify(guardianRepository, times(1)).save(any(Member.class));
        }

        @Test
        @DisplayName("Should throw GuardianNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            when(guardianRepository.findValidGuardianById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(GuardianNotFoundException.class,
                    () -> guardianService.updateGuardianById(999L, guardianCreateDTO));
            verify(guardianRepository, times(1)).findValidGuardianById(999L);
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
            when(guardianRepository.findById(1L)).thenReturn(Optional.of(guardianMember));
            when(guardianRepository.findById(2L)).thenReturn(Optional.of(regularMember));
            when(guardianRepository.save(any(Member.class))).thenReturn(regularMember);

            // Act & Assert
            assertDoesNotThrow(() -> guardianService.addMemberToGuardian(1L, 2L));

            verify(guardianRepository, times(2)).findById(anyLong());
            verify(guardianRepository, times(1)).save(any(Member.class));
        }

        @Test
        @DisplayName("Should throw GuardianNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            // Ensure the member lookup (memberId = 2L) is stubbed so Mockito strict
            // stubbing doesn't flag argument mismatch
            when(guardianRepository.findById(2L)).thenReturn(Optional.of(regularMember));
            when(guardianRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(GuardianNotFoundException.class,
                    () -> guardianService.addMemberToGuardian(999L, 2L));
        }

        @Test
        @DisplayName("Should throw MemberNotFoundException when member not found")
        void shouldThrowExceptionWhenMemberNotFound() {
            // Arrange
            // Only stub the member lookup to be empty - the guardian lookup won't be
            // invoked because the member is missing
            when(guardianRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(MemberNotFoundException.class,
                    () -> guardianService.addMemberToGuardian(1L, 999L));
        }
    }

    @Nested
    @DisplayName("removeGuardianIdFromMember Tests")
    class RemoveGuardianIdFromMemberTests {

        @Test
        @DisplayName("Should remove guardian ID from member successfully")
        void shouldRemoveGuardianIdFromMember() {
            // Assert: Create an adult member (18+ years old) for this test
            Member adultMember = Member.builder()
                    .memberId(3L)
                    .userId("adult-member-789")
                    .tenantId("tenant-1")
                    .firstName("Adult")
                    .lastName("Member")
                    .age(20)
                    .role("SCOUT")
                    .identification("1112223334")
                    .documentType(DocumentType.CC)
                    .phone("3001112233")
                    .isActive(true)
                    .status(Status.APPROVED)
                    .acceptanceDate(LocalDate.now())
                    .guardianId(1)
                    .subgroup(subgroup)
                    .build();
            
            when(guardianRepository.existsById(1L)).thenReturn(true);
            when(guardianRepository.findById(3L)).thenReturn(Optional.of(adultMember));
            when(guardianRepository.save(any(Member.class))).thenReturn(adultMember);

            // Act & Assert
            assertDoesNotThrow(() -> guardianService.removeGuardianIdFromMember(1L, 3L));

            verify(guardianRepository, times(1)).existsById(1L);
            verify(guardianRepository, times(1)).findById(3L);
            verify(guardianRepository, times(1)).save(any(Member.class));
        }

        @Test
        @DisplayName("Should throw GuardianNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            when(guardianRepository.existsById(999L)).thenReturn(false);

            // Act & Assert
            assertThrows(GuardianNotFoundException.class,
                    () -> guardianService.removeGuardianIdFromMember(999L, 2L));
        }

        @Test
        @DisplayName("Should throw MemberNotFoundException when member not found")
        void shouldThrowExceptionWhenMemberNotFound() {
            // Arrange
            when(guardianRepository.existsById(1L)).thenReturn(true);
            when(guardianRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(MemberNotFoundException.class,
                    () -> guardianService.removeGuardianIdFromMember(1L, 999L));
        }
    }

    @Nested
    @DisplayName("deleteGuardianById Tests")
    class DeleteGuardianByIdTests {

        @Test
        @DisplayName("Should delete guardian successfully")
        void shouldDeleteGuardian() {
            // Arrange
            when(guardianRepository.existsById(1L)).thenReturn(true);
            doNothing().when(guardianRepository).removeGuardianIdFromMembers(1L);
            doNothing().when(guardianRepository).deleteGuardianById(1L);

            // Act & Assert
            assertDoesNotThrow(() -> guardianService.deleteGuardianById(1L));

            verify(guardianRepository, times(1)).existsById(1L);
            verify(guardianRepository, times(1)).removeGuardianIdFromMembers(1L);
            verify(guardianRepository, times(1)).deleteGuardianById(1L);
        }

        @Test
        @DisplayName("Should throw GuardianNotFoundException when guardian not found")
        void shouldThrowExceptionWhenGuardianNotFound() {
            // Arrange
            when(guardianRepository.existsById(999L)).thenReturn(false);

            // Act & Assert
            assertThrows(GuardianNotFoundException.class,
                    () -> guardianService.deleteGuardianById(999L));
            verify(guardianRepository, times(1)).existsById(999L);
            verify(guardianRepository, never()).removeGuardianIdFromMembers(anyLong());
            verify(guardianRepository, never()).deleteGuardianById(anyLong());
        }
    }
}
