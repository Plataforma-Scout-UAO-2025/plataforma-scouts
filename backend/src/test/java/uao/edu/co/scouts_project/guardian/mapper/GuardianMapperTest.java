package uao.edu.co.scouts_project.guardian.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import uao.edu.co.scouts_project.guardian.dto.in.GuardianCreateDTO;
import uao.edu.co.scouts_project.guardian.dto.out.GuardianWithMembersDTO;
import uao.edu.co.scouts_project.guardian.dto.shared.MemberDTO;
import uao.edu.co.scouts_project.guardian.model.MemberCustom;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;
import uao.edu.co.scouts_project.member.model.Member;

public class GuardianMapperTest {

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
                .rol("ACUDIENTE")
                .build();

        // Setup Member with full data
        guardianMember = Member.builder()
                .memberId(1L)
                .userId("guardian-123")
                .tenantId("tenant-1")
                .firstName("John")
                .lastName("Doe")
                .age(35)
                .role("ACUDIENTE")
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
                .role("SCOUT")
                .identification("9876543210")
                .documentType(DocumentType.TI)
                .gender("FEMALE")
                .phone("3009876543")
                .birthDate(LocalDate.of(2013, 8, 10))
                .isActive(true)
                .status(Status.APPROVED)
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
                .birthDate(LocalDate.of(2013, 8, 10))
                .build();

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
            assertEquals("ACUDIENTE", result.getRole()); // String, not enum
        }

        @Test
        @DisplayName("Should use the role from rol field")
        void shouldUseRoleFromRolField() {
            // Arrange
            GuardianCreateDTO dtoWithRole = GuardianCreateDTO.builder()
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
                    .rol("ACUDIENTE")
                    .build();

            // Act
            Member result = GuardianMapper.toEntity(dtoWithRole);

            // Assert
            assertEquals("ACUDIENTE", result.getRole(), "Should use role from rol field"); // String, not enum
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
            GuardianWithMembersDTO result = GuardianMapper.toDTO(guardianMember, membersInCharge);

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
            GuardianWithMembersDTO result = GuardianMapper.toDTO(guardianMember, Collections.emptyList());

            // Assert
            assertNotNull(result);
            assertNotNull(result.getMembers());
            assertTrue(result.getMembers().isEmpty());
        }

        @Test
        @DisplayName("Should correctly map subgroup information")
        void shouldMapSubgroupInformation() {
            // Act
            GuardianWithMembersDTO result = GuardianMapper.toDTO(guardianMember, membersInCharge);

            // Assert
            assertNotNull(result.getSubgroup());
            assertEquals(1L, result.getSubgroup().getSubgroupId());
            assertEquals("Test Subgroup", result.getSubgroup().getName());
        }

        @Test
        @DisplayName("Should maintain member list order and content")
        void shouldMaintainMemberListOrderAndContent() {
            // Act
            GuardianWithMembersDTO result = GuardianMapper.toDTO(guardianMember, membersInCharge);

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
            assertNotNull(result.getRol());
            assertEquals("ACUDIENTE", result.getRol()); // String, not enum
        }

        @Test
        @DisplayName("Should map role correctly")
        void shouldMapRoleCorrectly() {
            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianCreateDTO(guardianMember);

            // Assert
            assertNotNull(result.getRol());
            assertEquals("ACUDIENTE", result.getRol()); // String, not enum
        }

        @Test
        @DisplayName("Should handle different roles")
        void shouldHandleDifferentRoles() {
            // Arrange
            guardianMember.setRole("SCOUTER");

            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianCreateDTO(guardianMember);

            // Assert
            assertEquals("SCOUTER", result.getRol()); // String, not enum
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
            memberWithRole.setRole("ADMIN_GLOBAL");

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
            assertEquals("Jane", result.getFirstName());
            assertEquals("Smith", result.getLastName());
            assertEquals("FEMALE", result.getGender());
            assertEquals("3009876543", result.getPhone());
            assertEquals(LocalDate.of(2013, 8, 10), result.getBirthDate());
        }

        @Test
        @DisplayName("Should handle different member values")
        void shouldHandleDifferentMemberValues() {
            // Arrange
            MemberCustom customMember = MemberCustom.builder()
                    .firstName("Test")
                    .lastName("User")
                    .identification("123456789")
                    .documentType(DocumentType.CC)
                    .emergencyContacts(Collections.emptyList())
                    .age(25)
                    .gender("OTHER")
                    .phone("3001112233")
                    .birthDate(LocalDate.of(2015, 12, 31))
                    .build();

            // Act
            MemberDTO result = GuardianMapper.toMemberDTO(customMember);

            // Assert
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
            MemberCustom maleMember = MemberCustom.builder()
                    .firstName("John").lastName("Doe").identification("123").documentType(DocumentType.CC)
                    .emergencyContacts(Collections.emptyList()).age(30).gender("MALE")
                    .phone("3001234567").birthDate(LocalDate.now()).build();
            MemberCustom femaleMember = MemberCustom.builder()
                    .firstName("Jane").lastName("Doe").identification("456").documentType(DocumentType.CC)
                    .emergencyContacts(Collections.emptyList()).age(25).gender("FEMALE")
                    .phone("3001234567").birthDate(LocalDate.now()).build();
            MemberCustom otherMember = MemberCustom.builder()
                    .firstName("Alex").lastName("Doe").identification("789").documentType(DocumentType.CC)
                    .emergencyContacts(Collections.emptyList()).age(28).gender("OTHER")
                    .phone("3001234567").birthDate(LocalDate.now()).build();

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
    @DisplayName("toGuardianDTO Tests")
    class ToGuardianDTOTests {

        @Test
        @DisplayName("Should convert Member to GuardianCreateDTO with memberId and address")
        void shouldConvertMemberToGuardianDTOWithMemberIdAndAddress() {
            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianDTO(guardianMember);

            // Assert
            assertNotNull(result);
            assertNotNull(result.getMemberId());
            assertEquals(1L, result.getMemberId());
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
            assertEquals("123 Main St", result.getAddress());
            assertEquals(LocalDate.of(2023, 1, 15), result.getAcceptanceDate());
            assertNotNull(result.getRol());
            assertEquals("ACUDIENTE", result.getRol());
        }

        @Test
        @DisplayName("Should include memberId field when converting with toGuardianDTO")
        void shouldIncludeMemberIdField() {
            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianDTO(guardianMember);

            // Assert
            assertNotNull(result.getMemberId());
            assertEquals(guardianMember.getMemberId(), result.getMemberId());
        }

        @Test
        @DisplayName("Should include address field when converting with toGuardianDTO")
        void shouldIncludeAddressField() {
            // Arrange
            guardianMember.setAddress("456 Oak Avenue");

            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianDTO(guardianMember);

            // Assert
            assertNotNull(result.getAddress());
            assertEquals("456 Oak Avenue", result.getAddress());
        }

        @Test
        @DisplayName("Should handle null address in toGuardianDTO")
        void shouldHandleNullAddress() {
            // Arrange
            guardianMember.setAddress(null);

            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianDTO(guardianMember);

            // Assert
            assertNull(result.getAddress());
        }

        @Test
        @DisplayName("Should preserve all fields including memberId and address")
        void shouldPreserveAllFieldsIncludingMemberIdAndAddress() {
            // Arrange
            guardianMember.setAddress("789 Pine Street");

            // Act
            GuardianCreateDTO result = GuardianMapper.toGuardianDTO(guardianMember);

            // Assert
            assertEquals(guardianMember.getMemberId(), result.getMemberId());
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
            assertEquals(guardianMember.getAddress(), result.getAddress());
            assertEquals(guardianMember.getAcceptanceDate(), result.getAcceptanceDate());
            assertEquals(guardianMember.getRole(), result.getRol());
        }

        @Test
        @DisplayName("Should differentiate from toGuardianCreateDTO by including memberId")
        void shouldDifferentiateFromToGuardianCreateDTO() {
            // Act
            GuardianCreateDTO resultWithId = GuardianMapper.toGuardianDTO(guardianMember);
            GuardianCreateDTO resultWithoutId = GuardianMapper.toGuardianCreateDTO(guardianMember);

            // Assert
            assertNotNull(resultWithId.getMemberId(), "toGuardianDTO should include memberId");
            assertNull(resultWithoutId.getMemberId(), "toGuardianCreateDTO should not include memberId");
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
                    .rol("ACUDIENTE")
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
