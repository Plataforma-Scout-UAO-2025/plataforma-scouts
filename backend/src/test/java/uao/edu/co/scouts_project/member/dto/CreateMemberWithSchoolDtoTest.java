package uao.edu.co.scouts_project.member.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class CreateMemberWithSchoolDtoTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidCreateMemberWithSchoolDto_shouldPassValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .memberId(1L)
                .tenantId("tenant-123")
                .institution("Colegio San José")
                .course("10-A")
                .build();

        CreateMemberWithSchoolDto dto = CreateMemberWithSchoolDto.builder()
                .member(memberDto)
                .school(schoolDto)
                .build();

        // Act
        Set<ConstraintViolation<CreateMemberWithSchoolDto>> violations = validator.validate(dto);

        // Assert
        assertTrue(violations.isEmpty(), "No debería haber violaciones de validación");
    }

    @Test
    void testCreateMemberWithSchoolDto_withNullMember_shouldFailValidation() {
        // Arrange
        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .memberId(1L)
                .tenantId("tenant-123")
                .institution("Colegio San José")
                .build();

        CreateMemberWithSchoolDto dto = CreateMemberWithSchoolDto.builder()
                .member(null)
                .school(schoolDto)
                .build();

        // Act
        Set<ConstraintViolation<CreateMemberWithSchoolDto>> violations = validator.validate(dto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("datos del miembro son obligatorios")));
    }

    @Test
    void testCreateMemberWithSchoolDto_withNullSchool_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        CreateMemberWithSchoolDto dto = CreateMemberWithSchoolDto.builder()
                .member(memberDto)
                .school(null)
                .build();

        // Act
        Set<ConstraintViolation<CreateMemberWithSchoolDto>> violations = validator.validate(dto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("datos escolares son obligatorios")));
    }

    @Test
    void testCreateMemberWithSchoolDto_withInvalidMember_shouldFailValidation() {
        // Arrange - Member sin firstName (obligatorio)
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("") // Vacío, debería fallar
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .memberId(1L)
                .tenantId("tenant-123")
                .institution("Colegio San José")
                .build();

        CreateMemberWithSchoolDto dto = CreateMemberWithSchoolDto.builder()
                .member(memberDto)
                .school(schoolDto)
                .build();

        // Act
        Set<ConstraintViolation<CreateMemberWithSchoolDto>> violations = validator.validate(dto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("nombre es obligatorio")));
    }

    @Test
    void testCreateMemberWithSchoolDto_withInvalidDocumentType_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("INVALID")
                .status("APPROVED")
                .build();

        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .memberId(1L)
                .tenantId("tenant-123")
                .institution("Colegio San José")
                .build();

        CreateMemberWithSchoolDto dto = CreateMemberWithSchoolDto.builder()
                .member(memberDto)
                .school(schoolDto)
                .build();

        // Act
        Set<ConstraintViolation<CreateMemberWithSchoolDto>> violations = validator.validate(dto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Tipo de documento inválido")));
    }

    @Test
    void testCreateMemberWithSchoolDto_builderPattern_shouldWork() {
        // Arrange & Act
        MemberDto memberDto = MemberDto.builder()
                .firstName("Juan")
                .lastName("Pérez")
                .tenantId("tenant-123")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .memberId(1L)
                .tenantId("tenant-123")
                .institution("Colegio San José")
                .course("10-A")
                .calendar("A")
                .shift("Mañana")
                .build();

        CreateMemberWithSchoolDto dto = CreateMemberWithSchoolDto.builder()
                .member(memberDto)
                .school(schoolDto)
                .build();

        // Assert
        assertNotNull(dto);
        assertNotNull(dto.getMember());
        assertNotNull(dto.getSchool());
        assertEquals("Juan", dto.getMember().getFirstName());
        assertEquals("Colegio San José", dto.getSchool().getInstitution());
    }

    @Test
    void testCreateMemberWithSchoolDto_noArgsConstructor_shouldWork() {
        // Arrange & Act
        CreateMemberWithSchoolDto dto = new CreateMemberWithSchoolDto();

        // Assert
        assertNotNull(dto);
        assertNull(dto.getMember());
        assertNull(dto.getSchool());
    }

    @Test
    void testCreateMemberWithSchoolDto_allArgsConstructor_shouldWork() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .firstName("Juan")
                .tenantId("tenant-123")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .institution("Colegio San José")
                .build();

        // Act
        CreateMemberWithSchoolDto dto = new CreateMemberWithSchoolDto(memberDto, schoolDto);

        // Assert
        assertNotNull(dto);
        assertEquals(memberDto, dto.getMember());
        assertEquals(schoolDto, dto.getSchool());
    }

    @Test
    void testCreateMemberWithSchoolDto_gettersAndSetters_shouldWork() {
        // Arrange
        CreateMemberWithSchoolDto dto = new CreateMemberWithSchoolDto();
        
        MemberDto memberDto = MemberDto.builder()
                .firstName("Juan")
                .tenantId("tenant-123")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .institution("Colegio San José")
                .build();

        // Act
        dto.setMember(memberDto);
        dto.setSchool(schoolDto);

        // Assert
        assertEquals(memberDto, dto.getMember());
        assertEquals(schoolDto, dto.getSchool());
    }

    @Test
    void testCreateMemberWithSchoolDto_withBothNull_shouldFailValidation() {
        // Arrange
        CreateMemberWithSchoolDto dto = CreateMemberWithSchoolDto.builder()
                .member(null)
                .school(null)
                .build();

        // Act
        Set<ConstraintViolation<CreateMemberWithSchoolDto>> violations = validator.validate(dto);

        // Assert
        assertEquals(2, violations.size());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("datos del miembro son obligatorios")));
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("datos escolares son obligatorios")));
    }

    @Test
    void testCreateMemberWithSchoolDto_nestedValidation_shouldCascade() {
        // Arrange - Member con email inválido
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .email("invalid-email") // Email inválido
                .build();

        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .memberId(1L)
                .tenantId("tenant-123")
                .institution("Colegio San José")
                .build();

        CreateMemberWithSchoolDto dto = CreateMemberWithSchoolDto.builder()
                .member(memberDto)
                .school(schoolDto)
                .build();

        // Act
        Set<ConstraintViolation<CreateMemberWithSchoolDto>> violations = validator.validate(dto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("formato del email")));
    }

    @Test
    void testCreateMemberWithSchoolDto_withCompleteData_shouldPassValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .age(15)
                .identification("1234567890")
                .documentType("TI")
                .email("juan.perez@example.com")
                .phone("3001234567")
                .address("Calle 123")
                .status("PENDING")
                .build();

        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .memberId(1L)
                .tenantId("tenant-123")
                .institution("Colegio San José")
                .course("10-A")
                .calendar("A")
                .shift("Mañana")
                .build();

        CreateMemberWithSchoolDto dto = CreateMemberWithSchoolDto.builder()
                .member(memberDto)
                .school(schoolDto)
                .build();

        // Act
        Set<ConstraintViolation<CreateMemberWithSchoolDto>> violations = validator.validate(dto);

        // Assert
        assertTrue(violations.isEmpty());
    }

    @Test
    void testCreateMemberWithSchoolDto_equals_shouldWorkCorrectly() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .firstName("Juan")
                .tenantId("tenant-123")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .institution("Colegio A")
                .build();

        CreateMemberWithSchoolDto dto1 = CreateMemberWithSchoolDto.builder()
                .member(memberDto)
                .school(schoolDto)
                .build();

        CreateMemberWithSchoolDto dto2 = CreateMemberWithSchoolDto.builder()
                .member(memberDto)
                .school(schoolDto)
                .build();

        // Assert
        assertEquals(dto1, dto2);
    }

    @Test
    void testCreateMemberWithSchoolDto_toString_shouldContainFields() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .firstName("Juan")
                .tenantId("tenant-123")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .institution("Colegio San José")
                .build();

        CreateMemberWithSchoolDto dto = CreateMemberWithSchoolDto.builder()
                .member(memberDto)
                .school(schoolDto)
                .build();

        // Act
        String toString = dto.toString();

        // Assert
        assertNotNull(toString);
        assertTrue(toString.contains("member"));
        assertTrue(toString.contains("school"));
    }

    @Test
    void testCreateMemberWithSchoolDto_withMultipleValidationErrors_shouldReportAll() {
        // Arrange - Member sin firstName y lastName
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("") // Vacío
                .lastName("") // Vacío
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        SchoolDataDto schoolDto = SchoolDataDto.builder()
                .memberId(1L)
                .tenantId("tenant-123")
                .institution("Colegio San José")
                .build();

        CreateMemberWithSchoolDto dto = CreateMemberWithSchoolDto.builder()
                .member(memberDto)
                .school(schoolDto)
                .build();

        // Act
        Set<ConstraintViolation<CreateMemberWithSchoolDto>> violations = validator.validate(dto);

        // Assert
        assertTrue(violations.size() >= 2);
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("nombre es obligatorio")));
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("apellido es obligatorio")));
    }
}