package uao.edu.co.scouts_project.member.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class MemberDtoTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidMemberDto_shouldPassValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .age(15)
                .identification("1234567890")
                .documentType("CC")
                .email("juan.perez@example.com")
                .phone("3001234567")
                .status("APPROVED")
                .isActive(true)
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertTrue(violations.isEmpty(), "No debería haber violaciones de validación");
    }

    @Test
    void testMemberDto_withBlankTenantId_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("tenant_id es obligatorio")));
    }

    @Test
    void testMemberDto_withBlankFirstName_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("nombre es obligatorio")));
    }

    @Test
    void testMemberDto_withShortFirstName_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("J")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("entre 2 y 100 caracteres")));
    }

    @Test
    void testMemberDto_withBlankLastName_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("apellido es obligatorio")));
    }

    @Test
    void testMemberDto_withNegativeAge_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .age(-5)
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("edad no puede ser negativa")));
    }

    @Test
    void testMemberDto_withAgeOverLimit_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .age(200)
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("edad no puede ser mayor a 150")));
    }

    @Test
    void testMemberDto_withBlankIdentification_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("")
                .documentType("CC")
                .status("APPROVED")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("identificación es obligatoria")));
    }

    @Test
    void testMemberDto_withInvalidDocumentType_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("INVALID")
                .status("APPROVED")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Tipo de documento inválido")));
    }

    @Test
    void testMemberDto_withAllValidDocumentTypes_shouldPassValidation() {
        // Arrange & Act & Assert
        String[] validTypes = {"CC", "TI", "CE", "PASSPORT", "RC", "NUIP"};
        
        for (String type : validTypes) {
            MemberDto memberDto = MemberDto.builder()
                    .tenantId("tenant-123")
                    .firstName("Juan")
                    .lastName("Pérez")
                    .identification("1234567890")
                    .documentType(type)
                    .status("APPROVED")
                    .build();

            Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);
            
            assertTrue(violations.stream().noneMatch(v -> 
                    v.getPropertyPath().toString().equals("documentType")),
                    "DocumentType " + type + " debería ser válido");
        }
    }

    @Test
    void testMemberDto_withInvalidEmail_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .email("invalid-email")
                .status("APPROVED")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("formato del email")));
    }

    @Test
    void testMemberDto_withValidEmail_shouldPassValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .email("juan.perez@example.com")
                .status("APPROVED")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertTrue(violations.stream().noneMatch(v -> 
                v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void testMemberDto_withInvalidPhoneFormat_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .phone("123")
                .status("APPROVED")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("teléfono debe contener entre 7 y 15 dígitos")));
    }

    @Test
    void testMemberDto_withValidPhoneFormats_shouldPassValidation() {
        // Arrange & Act & Assert
        String[] validPhones = {"3001234567", "+573001234567", "1234567", "123456789012345"};
        
        for (String phone : validPhones) {
            MemberDto memberDto = MemberDto.builder()
                    .tenantId("tenant-123")
                    .firstName("Juan")
                    .lastName("Pérez")
                    .identification("1234567890")
                    .documentType("CC")
                    .phone(phone)
                    .status("APPROVED")
                    .build();

            Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);
            
            assertTrue(violations.stream().noneMatch(v -> 
                    v.getPropertyPath().toString().equals("phone")),
                    "Phone " + phone + " debería ser válido");
        }
    }

    @Test
    void testMemberDto_withInvalidStatus_shouldFailValidation() {
        // Arrange
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("INVALID_STATUS")
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("Estado inválido")));
    }

    @Test
    void testMemberDto_withAllValidStatuses_shouldPassValidation() {
        // Arrange & Act & Assert
        String[] validStatuses = {"APPROVED", "REJECTED", "PENDING"};
        
        for (String status : validStatuses) {
            MemberDto memberDto = MemberDto.builder()
                    .tenantId("tenant-123")
                    .firstName("Juan")
                    .lastName("Pérez")
                    .identification("1234567890")
                    .documentType("CC")
                    .status(status)
                    .build();

            Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);
            
            assertTrue(violations.stream().noneMatch(v -> 
                    v.getPropertyPath().toString().equals("status")),
                    "Status " + status + " debería ser válido");
        }
    }

    @Test
    void testMemberDto_withLongHobbies_shouldFailValidation() {
        // Arrange
        String longHobbies = "a".repeat(501);
        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .hobbies(longHobbies)
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("hobbies no pueden exceder 500 caracteres")));
    }

    @Test
    void testMemberDto_withValidEmergencyContacts_shouldPassValidation() {
        // Arrange
        MemberDto.EmergencyContactDto contact = MemberDto.EmergencyContactDto.builder()
                .name("María Pérez")
                .relationship("Madre")
                .phone("3001234567")
                .build();

        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .emergencyContacts(List.of(contact))
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertTrue(violations.isEmpty());
    }

    @Test
    void testEmergencyContactDto_withBlankName_shouldFailValidation() {
        // Arrange
        MemberDto.EmergencyContactDto contact = MemberDto.EmergencyContactDto.builder()
                .name("")
                .relationship("Madre")
                .phone("3001234567")
                .build();

        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .emergencyContacts(List.of(contact))
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("nombre del contacto de emergencia es obligatorio")));
    }

    @Test
    void testEmergencyContactDto_withInvalidPhone_shouldFailValidation() {
        // Arrange
        MemberDto.EmergencyContactDto contact = MemberDto.EmergencyContactDto.builder()
                .name("María Pérez")
                .relationship("Madre")
                .phone("123")
                .build();

        MemberDto memberDto = MemberDto.builder()
                .tenantId("tenant-123")
                .firstName("Juan")
                .lastName("Pérez")
                .identification("1234567890")
                .documentType("CC")
                .status("APPROVED")
                .emergencyContacts(List.of(contact))
                .build();

        // Act
        Set<ConstraintViolation<MemberDto>> violations = validator.validate(memberDto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("teléfono debe contener entre 7 y 15 dígitos")));
    }

    @Test
    void testMemberDto_builderPattern_shouldWork() {
        // Arrange & Act
        MemberDto memberDto = MemberDto.builder()
                .memberId(1L)
                .userId("user-123")
                .tenantId("tenant-123")
                .guardianId(1)
                .firstName("Juan")
                .lastName("Pérez")
                .age(15)
                .role("Scout")
                .identification("1234567890")
                .documentType("CC")
                .email("juan@example.com")
                .gender("M")
                .birthDate(LocalDate.of(2008, 5, 15))
                .address("Calle 123")
                .phone("3001234567")
                .weight("60kg")
                .height("1.65m")
                .hobbies("Lectura, Deportes")
                .sports("Fútbol")
                .instruments("Guitarra")
                .isActive(true)
                .relationship("Hijo")
                .status("APPROVED")
                .acceptanceDate(LocalDate.now())
                .build();

        // Assert
        assertNotNull(memberDto);
        assertEquals("Juan", memberDto.getFirstName());
        assertEquals("Pérez", memberDto.getLastName());
        assertEquals(15, memberDto.getAge());
        assertTrue(memberDto.getIsActive());
    }

    @Test
    void testMemberDto_gettersAndSetters_shouldWork() {
        // Arrange
        MemberDto memberDto = new MemberDto();

        // Act
        memberDto.setFirstName("Juan");
        memberDto.setLastName("Pérez");
        memberDto.setAge(15);

        // Assert
        assertEquals("Juan", memberDto.getFirstName());
        assertEquals("Pérez", memberDto.getLastName());
        assertEquals(15, memberDto.getAge());
    }
}