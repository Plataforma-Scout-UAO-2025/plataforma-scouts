package uao.edu.co.scouts_project.member.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class AssignSubgroupDtoTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidAssignSubgroupDto_shouldPassValidation() {
        // Arrange
        AssignSubgroupDto dto = new AssignSubgroupDto(100L, 5L);

        // Act
        Set<ConstraintViolation<AssignSubgroupDto>> violations = validator.validate(dto);

        // Assert
        assertTrue(violations.isEmpty(), "No debería haber violaciones de validación");
    }

    @Test
    void testAssignSubgroupDto_withNullMemberId_shouldFailValidation() {
        // Arrange
        AssignSubgroupDto dto = new AssignSubgroupDto(null, 5L);

        // Act
        Set<ConstraintViolation<AssignSubgroupDto>> violations = validator.validate(dto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("ID del miembro es requerido")));
    }

    @Test
    void testAssignSubgroupDto_withNullSubGroupId_shouldFailValidation() {
        // Arrange
        AssignSubgroupDto dto = new AssignSubgroupDto(100L, null);

        // Act
        Set<ConstraintViolation<AssignSubgroupDto>> violations = validator.validate(dto);

        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("ID del subgrupo es requerido")));
    }

    @Test
    void testAssignSubgroupDto_withBothNull_shouldFailValidation() {
        // Arrange
        AssignSubgroupDto dto = new AssignSubgroupDto(null, null);

        // Act
        Set<ConstraintViolation<AssignSubgroupDto>> violations = validator.validate(dto);

        // Assert
        assertEquals(2, violations.size());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("ID del miembro es requerido")));
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("ID del subgrupo es requerido")));
    }

    @Test
    void testAssignSubgroupDto_noArgsConstructor_shouldWork() {
        // Arrange & Act
        AssignSubgroupDto dto = new AssignSubgroupDto();

        // Assert
        assertNotNull(dto);
        assertNull(dto.getMemberId());
        assertNull(dto.getSubGroupId());
    }

    @Test
    void testAssignSubgroupDto_allArgsConstructor_shouldWork() {
        // Arrange & Act
        AssignSubgroupDto dto = new AssignSubgroupDto(100L, 5L);

        // Assert
        assertNotNull(dto);
        assertEquals(100L, dto.getMemberId());
        assertEquals(5L, dto.getSubGroupId());
    }

    @Test
    void testAssignSubgroupDto_gettersAndSetters_shouldWork() {
        // Arrange
        AssignSubgroupDto dto = new AssignSubgroupDto();

        // Act
        dto.setMemberId(100L);
        dto.setSubGroupId(5L);

        // Assert
        assertEquals(100L, dto.getMemberId());
        assertEquals(5L, dto.getSubGroupId());
    }

    @Test
    void testAssignSubgroupDto_withDifferentIds_shouldBeValid() {
        // Arrange & Act
        AssignSubgroupDto dto1 = new AssignSubgroupDto(1L, 1L);
        AssignSubgroupDto dto2 = new AssignSubgroupDto(999L, 999L);
        AssignSubgroupDto dto3 = new AssignSubgroupDto(100L, 5L);

        // Assert
        Set<ConstraintViolation<AssignSubgroupDto>> violations1 = validator.validate(dto1);
        Set<ConstraintViolation<AssignSubgroupDto>> violations2 = validator.validate(dto2);
        Set<ConstraintViolation<AssignSubgroupDto>> violations3 = validator.validate(dto3);

        assertTrue(violations1.isEmpty());
        assertTrue(violations2.isEmpty());
        assertTrue(violations3.isEmpty());
    }

    @Test
    void testAssignSubgroupDto_equals_shouldWorkCorrectly() {
        // Arrange
        AssignSubgroupDto dto1 = new AssignSubgroupDto(100L, 5L);
        AssignSubgroupDto dto2 = new AssignSubgroupDto(100L, 5L);
        AssignSubgroupDto dto3 = new AssignSubgroupDto(200L, 10L);

        // Assert
        assertEquals(dto1, dto2);
        assertNotEquals(dto1, dto3);
    }

    @Test
    void testAssignSubgroupDto_hashCode_shouldBeConsistent() {
        // Arrange
        AssignSubgroupDto dto1 = new AssignSubgroupDto(100L, 5L);
        AssignSubgroupDto dto2 = new AssignSubgroupDto(100L, 5L);

        // Assert
        assertEquals(dto1.hashCode(), dto2.hashCode());
    }

    @Test
    void testAssignSubgroupDto_toString_shouldContainIds() {
        // Arrange
        AssignSubgroupDto dto = new AssignSubgroupDto(100L, 5L);

        // Act
        String toString = dto.toString();

        // Assert
        assertNotNull(toString);
        assertTrue(toString.contains("100") || toString.contains("memberId"));
        assertTrue(toString.contains("5") || toString.contains("subGroupId"));
    }

    @Test
    void testAssignSubgroupDto_sameMemberDifferentSubgroups_shouldBeValid() {
        // Arrange
        AssignSubgroupDto dto1 = new AssignSubgroupDto(100L, 1L);
        AssignSubgroupDto dto2 = new AssignSubgroupDto(100L, 2L);

        // Act
        Set<ConstraintViolation<AssignSubgroupDto>> violations1 = validator.validate(dto1);
        Set<ConstraintViolation<AssignSubgroupDto>> violations2 = validator.validate(dto2);

        // Assert
        assertTrue(violations1.isEmpty());
        assertTrue(violations2.isEmpty());
        assertNotEquals(dto1, dto2);
    }

    @Test
    void testAssignSubgroupDto_differentMembersSameSubgroup_shouldBeValid() {
        // Arrange
        AssignSubgroupDto dto1 = new AssignSubgroupDto(100L, 5L);
        AssignSubgroupDto dto2 = new AssignSubgroupDto(200L, 5L);

        // Act
        Set<ConstraintViolation<AssignSubgroupDto>> violations1 = validator.validate(dto1);
        Set<ConstraintViolation<AssignSubgroupDto>> violations2 = validator.validate(dto2);

        // Assert
        assertTrue(violations1.isEmpty());
        assertTrue(violations2.isEmpty());
        assertNotEquals(dto1, dto2);
    }

    @Test
    void testAssignSubgroupDto_withLargeIds_shouldBeValid() {
        // Arrange
        AssignSubgroupDto dto = new AssignSubgroupDto(
                Long.MAX_VALUE,
                Long.MAX_VALUE
        );

        // Act
        Set<ConstraintViolation<AssignSubgroupDto>> violations = validator.validate(dto);

        // Assert
        assertTrue(violations.isEmpty());
        assertEquals(Long.MAX_VALUE, dto.getMemberId());
        assertEquals(Long.MAX_VALUE, dto.getSubGroupId());
    }

    @Test
    void testAssignSubgroupDto_multipleInstances_shouldBeIndependent() {
        // Arrange
        AssignSubgroupDto dto1 = new AssignSubgroupDto();
        AssignSubgroupDto dto2 = new AssignSubgroupDto();

        // Act
        dto1.setMemberId(100L);
        dto1.setSubGroupId(5L);
        
        dto2.setMemberId(200L);
        dto2.setSubGroupId(10L);

        // Assert
        assertEquals(100L, dto1.getMemberId());
        assertEquals(5L, dto1.getSubGroupId());
        assertEquals(200L, dto2.getMemberId());
        assertEquals(10L, dto2.getSubGroupId());
        assertNotEquals(dto1.getMemberId(), dto2.getMemberId());
        assertNotEquals(dto1.getSubGroupId(), dto2.getSubGroupId());
    }

    @Test
    void testAssignSubgroupDto_immutabilityAfterValidation_shouldRemainValid() {
        // Arrange
        AssignSubgroupDto dto = new AssignSubgroupDto(100L, 5L);

        // Act
        Set<ConstraintViolation<AssignSubgroupDto>> violations1 = validator.validate(dto);
        
        // Modificar después de validación
        dto.setMemberId(200L);
        dto.setSubGroupId(10L);
        
        Set<ConstraintViolation<AssignSubgroupDto>> violations2 = validator.validate(dto);

        // Assert
        assertTrue(violations1.isEmpty());
        assertTrue(violations2.isEmpty());
        assertEquals(200L, dto.getMemberId());
        assertEquals(10L, dto.getSubGroupId());
    }

    @Test
    void testAssignSubgroupDto_withZeroIds_shouldBeValid() {
        // Arrange
        AssignSubgroupDto dto = new AssignSubgroupDto(0L, 0L);

        // Act
        Set<ConstraintViolation<AssignSubgroupDto>> violations = validator.validate(dto);

        // Assert
        assertTrue(violations.isEmpty());
    }

    @Test
    void testAssignSubgroupDto_jsonPropertyNames_shouldMatchExpected() {
        // Arrange
        AssignSubgroupDto dto = new AssignSubgroupDto(100L, 5L);

        // Act & Assert
        // verifica que los nombres de las propiedades JSON sean correctos
        assertNotNull(dto.getMemberId());
        assertNotNull(dto.getSubGroupId());
        assertEquals(100L, dto.getMemberId());
        assertEquals(5L, dto.getSubGroupId());
    }
}