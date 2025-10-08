package uao.edu.co.scouts_project.guardian.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWIthMemberDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.model.Member;
import uao.edu.co.scouts_project.guardian.model.MemberCustom;
import uao.edu.co.scouts_project.guardian.shared.enums.DocumentType;
import uao.edu.co.scouts_project.guardian.shared.enums.Status;
import uao.edu.co.scouts_project.infrastructure.security.Role;
import uao.edu.co.scouts_project.organigram.Subgroup;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("GuardianMapper Tests")
class GuardianMapperTest {

    private GuardianCreateDTO guardianCreateDTO;
    private Member guardianMember;
    private Member memberWithRole;
    private MemberCustom memberCustom;
    private Subgroup subgroup;
    private List<MemberDTO> membersInCharge;

    @BeforeEach
    void setUp() {
        // Setup Subgroup
        subgroup = Subgroup.builder()
                .subgroupId(1L)
                .name("Test Subgroup")
                .description("Test Description")
                .isActive(true)
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
                .acceptanceDate(LocalDate.of(2023, 1, 15))
                .roles(List.of(Role.ACUDIENTE))
                .build();

        // Setup Member with full data
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
                .email("john.doe@example.com")
                .gender("MALE")
                .birthDate(LocalDate.of(1988, 5, 20))
                .address("123 Main St")
                .phone("3001234567")
                .weight("75")
                .height("180")
                .hobbies("Reading")
                .sports("Soccer")
                .instruments("Guitar")
                .isActive(true)
                .relationship("Father")
                .status(Status.APPROVED)
                .acceptanceDate(LocalDate.of(2023, 1, 15))
                .subgroup(subgroup)
                .guardianId(null)
                .build();

        // Setup Member with Role
        memberWithRole = Member.builder()
                .memberId(2L)
                .userId("member-456")
                .tenantId("tenant-1")
                .firstName("Jane")
                .lastName("Smith")
                .age(10)
                .role(Role.SCOUT)
                .identification("9876543210")
                .documentType(DocumentType.TI)
                .gender("FEMALE")
                .phone("3009876543")
                .birthDate(LocalDate.of(2013, 8, 10))
                .isActive(true)
                .status(Status.APPROVED)
                .build();

        // Setup MemberCustom
        memberCustom = new MemberCustom(
                2L,
                "Jane",
                "Smith",
                "FEMALE",
                "3009876543",
                LocalDate.of(2013, 8, 10));

        // Setup members in charge
        membersInCharge = Arrays.asList(
                MemberDTO.builder()
                        .userId("member-456")
                        .firstName("Jane")
                        .lastName("Smith")
                        .build(),
                MemberDTO.builder()
                        .userId("member-789")
                        .firstName("Bob")
                        .lastName("Johnson")
                        .build());
    }

    @Nested
    @DisplayName("toEntity Tests")
    class ToEntityTests {

        @Test
        @DisplayName("Should convert GuardianCreateDTO to Member entity with all fields")
        void shouldConvertGuardianCreateDTOToMember() {
            // Act
            Member result = GuardianMapper.toEntity(guardianCreateDTO);

            // Assert
            assertNotNull(result);
            assertEquals("guardian-123", result.getUserId());
            assertEquals("tenant-1", result.getTenantId());
            assertNull(result.getSubgroup(), "Subgroup should be null in toEntity");
            assertEquals("John", result.getFirstName());
            assertEquals("Doe", result.getLastName());
            assertEquals(35, result.getAge());
            assertEquals("1234567890", result.getIdentification());
            assertEquals(DocumentType.CC, result.getDocumentType());
            assertEquals("3001234567", result.getPhone());
            assertTrue(result.getIsActive());
            assertEquals("Father", result.getRelationship());
            assertEquals(Status.APPROVED, result.getStatus());
            assertEquals(LocalDate.of(2023, 1, 15), result.getAcceptanceDate());
            assertEquals(Role.ACUDIENTE, result.getRole());
        }

        @Test
        @DisplayName("Should use first role from roles list")
        void shouldUseFirstRoleFromList() {
            // Arrange
            GuardianCreateDTO dtoWithMultipleRoles = GuardianCreateDTO.builder()
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
                    .roles(List.of(Role.ACUDIENTE, Role.SCOUTER, Role.ADMIN_GLOBAL))
                    .build();

            // Act
            Member result = GuardianMapper.toEntity(dtoWithMultipleRoles);

            // Assert
            assertEquals(Role.ACUDIENTE, result.getRole(), "Should use first role in list");
        }

        @Test
        @DisplayName("Should handle null subgroup correctly")
        void shouldHandleNullSubgroup() {
            // Act
            Member result = GuardianMapper.toEntity(guardianCreateDTO);

            // Assert
            assertNull(result.getSubgroup());
        }

        @Test
        @DisplayName("Should handle different document types")
        void shouldHandleDifferentDocumentTypes() {
            // Arrange
            guardianCreateDTO.setDocumentType(DocumentType.CE);

            // Act
            Member result = GuardianMapper.toEntity(guardianCreateDTO);

            // Assert
            assertEquals(DocumentType.CE, result.getDocumentType());
        }

        @Test
        @DisplayName("Should handle different status values")
        void shouldHandleDifferentStatusValues() {
            // Arrange
            guardianCreateDTO.setStatus(Status.PENDING);

            // Act
            Member result = GuardianMapper.toEntity(guardianCreateDTO);

            // Assert
            assertEquals(Status.PENDING, result.getStatus());
        }
    }

    @Nested
    @DisplayName("toDTO (GuardianWIthMemberDTO) Tests")
    class ToDTOTests {

        @Test
        @DisplayName("Should convert Member to GuardianWIthMemberDTO with members")
        void shouldConvertMemberToGuardianWIthMemberDTO() {
            // Act
            GuardianWIthMemberDTO result = GuardianMapper.toDTO(guardianMember, membersInCharge);

            // Assert
            assertNotNull(result);
            assertEquals("guardian-123", result.getUserId());
            assertEquals("tenant-1", result.getTenantId());
            assertNotNull(result.getSubgroup());
            assertEquals(1L, result.getSubgroup().getSubgroupId());
            assertEquals("Test Subgroup", result.getSubgroup().getName());
            assertEquals("John", result.getFirstName());
            assertEquals("Doe", result.getLastName());
            assertEquals(35, result.getAge());
            assertEquals("1234567890", result.getIdentification());
            assertEquals(DocumentType.CC, result.getDocumentType());
            assertEquals("3001234567", result.getPhone());
            assertTrue(result.getIsActive());
            assertEquals("Father", result.getRelationship());
            assertEquals(Status.APPROVED, result.getStatus());
            assertEquals(LocalDate.of(2023, 1, 15), result.getAcceptanceDate());
            assertNotNull(result.getMembers());
            assertEquals(2, result.getMembers().size());
        }

        @Test
        @DisplayName("Should include empty members list when no members in charge")
        void shouldHandleEmptyMembersList() {
            // Act
            GuardianWIthMemberDTO result = GuardianMapper.toDTO(guardianMember, Collections.emptyList());

            // Assert
            assertNotNull(result);
            assertNotNull(result.getMembers());
            assertTrue(result.getMembers().isEmpty());
        }

        @Test
        @DisplayName("Should correctly map subgroup information")
        void shouldMapSubgroupInformation() {
            // Act
            GuardianWIthMemberDTO result = GuardianMapper.toDTO(guardianMember, membersInCharge);

            // Assert
            assertNotNull(result.getSubgroup());
            assertEquals(1L, result.getSubgroup().getSubgroupId());
            assertEquals("Test Subgroup", result.getSubgroup().getName());
        }

        @Test
        @DisplayName("Should maintain member list order and content")
        void shouldMaintainMemberListOrderAndContent() {
            // Act
            GuardianWIthMemberDTO result = GuardianMapper.toDTO(guardianMember, membersInCharge);

            // Assert
            assertNotNull(result.getMembers());
            assertEquals(2, result.getMembers().size());
            assertEquals("member-456", result.getMembers().get(0).getUserId());
            assertEquals("Jane", result.getMembers().get(0).getFirstName());
            assertEquals("member-789", result.getMembers().get(1).getUserId());
            assertEquals("Bob", result.getMembers().get(1).getFirstName());
        }
    }

    @Nested
    @DisplayName("toGuardianCreateDTO Tests")
    class ToGuardianCreateDTOTests {

        @Test
        @DisplayName("Should convert Member to GuardianCreateDTO with all fields")
        void shouldConvertMemberToGuardianCreateDTO() {
            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianCreateDTO(guardianMember);

            // Assert
            assertNotNull(result);
            assertEquals("guardian-123", result.getUserId());
            assertEquals("tenant-1", result.getTenantId());
            assertEquals("John", result.getFirstName());
            assertEquals("Doe", result.getLastName());
            assertEquals(35, result.getAge());
            assertEquals("1234567890", result.getIdentification());
            assertEquals(DocumentType.CC, result.getDocumentType());
            assertEquals("3001234567", result.getPhone());
            assertTrue(result.getIsActive());
            assertEquals("Father", result.getRelationship());
            assertEquals(Status.APPROVED, result.getStatus());
            assertEquals(LocalDate.of(2023, 1, 15), result.getAcceptanceDate());
            assertNotNull(result.getRoles());
            assertEquals(1, result.getRoles().size());
            assertEquals(Role.ACUDIENTE, result.getRoles().get(0));
        }

        @Test
        @DisplayName("Should wrap role in list correctly")
        void shouldWrapRoleInList() {
            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianCreateDTO(guardianMember);

            // Assert
            assertNotNull(result.getRoles());
            assertEquals(1, result.getRoles().size());
            assertEquals(Role.ACUDIENTE, result.getRoles().get(0));
        }

        @Test
        @DisplayName("Should handle different roles")
        void shouldHandleDifferentRoles() {
            // Arrange
            guardianMember.setRole(Role.SCOUTER);

            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianCreateDTO(guardianMember);

            // Assert
            assertEquals(Role.SCOUTER, result.getRoles().get(0));
        }

        @Test
        @DisplayName("Should preserve all guardian data")
        void shouldPreserveAllGuardianData() {
            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianCreateDTO(guardianMember);

            // Assert
            assertEquals(guardianMember.getUserId(), result.getUserId());
            assertEquals(guardianMember.getTenantId(), result.getTenantId());
            assertEquals(guardianMember.getFirstName(), result.getFirstName());
            assertEquals(guardianMember.getLastName(), result.getLastName());
            assertEquals(guardianMember.getAge(), result.getAge());
            assertEquals(guardianMember.getIdentification(), result.getIdentification());
            assertEquals(guardianMember.getDocumentType(), result.getDocumentType());
            assertEquals(guardianMember.getPhone(), result.getPhone());
            assertEquals(guardianMember.getIsActive(), result.getIsActive());
            assertEquals(guardianMember.getRelationship(), result.getRelationship());
            assertEquals(guardianMember.getStatus(), result.getStatus());
            assertEquals(guardianMember.getAcceptanceDate(), result.getAcceptanceDate());
        }
    }

    @Nested
    @DisplayName("toMemberDTO (from Member) Tests")
    class ToMemberDTOFromMemberTests {

        @Test
        @DisplayName("Should convert Member to MemberDTO with all fields")
        void shouldConvertMemberToMemberDTO() {
            // Act
            MemberDTO result = GuardianMapper.toMemberDTO(memberWithRole);

            // Assert
            assertNotNull(result);
            assertEquals("member-456", result.getUserId());
            assertEquals("tenant-1", result.getTenantId());
            assertEquals("Jane", result.getFirstName());
            assertEquals("Smith", result.getLastName());
            assertEquals("FEMALE", result.getGender());
            assertEquals("3009876543", result.getPhone());
            assertEquals(LocalDate.of(2013, 8, 10), result.getBirthDate());
            assertEquals("SCOUT", result.getRole());
        }

        @Test
        @DisplayName("Should convert role enum to string")
        void shouldConvertRoleEnumToString() {
            // Act
            MemberDTO result = GuardianMapper.toMemberDTO(memberWithRole);

            // Assert
            assertEquals("SCOUT", result.getRole());
            assertTrue(result.getRole() instanceof String);
        }

        @Test
        @DisplayName("Should handle different role types")
        void shouldHandleDifferentRoleTypes() {
            // Arrange
            memberWithRole.setRole(Role.ADMIN_GLOBAL);

            // Act
            MemberDTO result = GuardianMapper.toMemberDTO(memberWithRole);

            // Assert
            assertEquals("ADMIN_GLOBAL", result.getRole());
        }

        @Test
        @DisplayName("Should map all personal information correctly")
        void shouldMapAllPersonalInformation() {
            // Arrange
            memberWithRole.setGender("MALE");
            memberWithRole.setPhone("3111111111");
            memberWithRole.setBirthDate(LocalDate.of(2010, 1, 1));

            // Act
            MemberDTO result = GuardianMapper.toMemberDTO(memberWithRole);

            // Assert
            assertEquals("MALE", result.getGender());
            assertEquals("3111111111", result.getPhone());
            assertEquals(LocalDate.of(2010, 1, 1), result.getBirthDate());
        }
    }

    @Nested
    @DisplayName("toMemberDTO (from MemberCustom) Tests")
    class ToMemberDTOFromMemberCustomTests {

        @Test
        @DisplayName("Should convert MemberCustom to MemberDTO with all fields")
        void shouldConvertMemberCustomToMemberDTO() {
            // Act
            MemberDTO result = GuardianMapper.toMemberDTO(memberCustom);

            // Assert
            assertNotNull(result);
            assertEquals("2", result.getUserId());
            assertEquals("Jane", result.getFirstName());
            assertEquals("Smith", result.getLastName());
            assertEquals("FEMALE", result.getGender());
            assertEquals("3009876543", result.getPhone());
            assertEquals(LocalDate.of(2013, 8, 10), result.getBirthDate());
        }

        @Test
        @DisplayName("Should convert memberId Long to String")
        void shouldConvertMemberIdLongToString() {
            // Act
            MemberDTO result = GuardianMapper.toMemberDTO(memberCustom);

            // Assert
            assertEquals("2", result.getUserId());
            assertTrue(result.getUserId() instanceof String);
        }

        @Test
        @DisplayName("Should handle different memberId values")
        void shouldHandleDifferentMemberIdValues() {
            // Arrange
            MemberCustom customMember = new MemberCustom(
                    999L,
                    "Test",
                    "User",
                    "OTHER",
                    "3001112233",
                    LocalDate.of(2015, 12, 31));

            // Act
            MemberDTO result = GuardianMapper.toMemberDTO(customMember);

            // Assert
            assertEquals("999", result.getUserId());
            assertEquals("Test", result.getFirstName());
            assertEquals("User", result.getLastName());
        }

        @Test
        @DisplayName("Should not include role field when converting from MemberCustom")
        void shouldNotIncludeRoleField() {
            // Act
            MemberDTO result = GuardianMapper.toMemberDTO(memberCustom);

            // Assert
            assertNull(result.getRole(), "Role should be null when converting from MemberCustom");
        }

        @Test
        @DisplayName("Should handle all gender types")
        void shouldHandleAllGenderTypes() {
            // Arrange
            MemberCustom maleMember = new MemberCustom(3L, "John", "Doe", "MALE", "3001234567", LocalDate.now());
            MemberCustom femaleMember = new MemberCustom(4L, "Jane", "Doe", "FEMALE", "3001234567", LocalDate.now());
            MemberCustom otherMember = new MemberCustom(5L, "Alex", "Doe", "OTHER", "3001234567", LocalDate.now());

            // Act
            MemberDTO maleResult = GuardianMapper.toMemberDTO(maleMember);
            MemberDTO femaleResult = GuardianMapper.toMemberDTO(femaleMember);
            MemberDTO otherResult = GuardianMapper.toMemberDTO(otherMember);

            // Assert
            assertEquals("MALE", maleResult.getGender());
            assertEquals("FEMALE", femaleResult.getGender());
            assertEquals("OTHER", otherResult.getGender());
        }
    }

    @Nested
    @DisplayName("Edge Cases and Null Handling Tests")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle minimum required fields in GuardianCreateDTO")
        void shouldHandleMinimumRequiredFields() {
            // Arrange
            GuardianCreateDTO minimalDTO = GuardianCreateDTO.builder()
                    .userId("minimal-123")
                    .tenantId("tenant-1")
                    .firstName("Min")
                    .lastName("Mal")
                    .age(30)
                    .identification("1111111111")
                    .documentType(DocumentType.CC)
                    .phone("3001111111")
                    .isActive(true)
                    .relationship("Guardian")
                    .status(Status.APPROVED)
                    .acceptanceDate(LocalDate.now())
                    .roles(List.of(Role.ACUDIENTE))
                    .build();

            // Act
            Member result = GuardianMapper.toEntity(minimalDTO);

            // Assert
            assertNotNull(result);
            assertEquals("minimal-123", result.getUserId());
            assertEquals("Min", result.getFirstName());
        }

        @Test
        @DisplayName("Should handle inactive status")
        void shouldHandleInactiveStatus() {
            // Arrange
            guardianMember.setIsActive(false);

            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianCreateDTO(guardianMember);

            // Assert
            assertFalse(result.getIsActive());
        }

        @Test
        @DisplayName("Should handle rejected status")
        void shouldHandleRejectedStatus() {
            // Arrange
            guardianMember.setStatus(Status.REJECTED);

            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianCreateDTO(guardianMember);

            // Assert
            assertEquals(Status.REJECTED, result.getStatus());
        }

        @Test
        @DisplayName("Should handle special characters in names")
        void shouldHandleSpecialCharactersInNames() {
            // Arrange
            guardianMember.setFirstName("José María");
            guardianMember.setLastName("O'Brien-García");

            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianCreateDTO(guardianMember);

            // Assert
            assertEquals("José María", result.getFirstName());
            assertEquals("O'Brien-García", result.getLastName());
        }

        @Test
        @DisplayName("Should handle long identification numbers")
        void shouldHandleLongIdentificationNumbers() {
            // Arrange
            guardianMember.setIdentification("1234567890123456789");

            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianCreateDTO(guardianMember);

            // Assert
            assertEquals("1234567890123456789", result.getIdentification());
        }
    }
}
