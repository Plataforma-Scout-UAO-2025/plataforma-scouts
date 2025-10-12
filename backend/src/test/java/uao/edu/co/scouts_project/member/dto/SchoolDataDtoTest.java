package uao.edu.co.scouts_project.member.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SchoolDataDtoTest {

    @Test
    void testSchoolDataDto_builderPattern_shouldWork() {
        // Arrange & Act
        SchoolDataDto schoolDataDto = SchoolDataDto.builder()
                .schoolDataId(1L)
                .memberId(100L)
                .tenantId("tenant-123")
                .institution("Colegio San José")
                .course("10-A")
                .calendar("A")
                .shift("Mañana")
                .build();

        // Assert
        assertNotNull(schoolDataDto);
        assertEquals(1L, schoolDataDto.getSchoolDataId());
        assertEquals(100L, schoolDataDto.getMemberId());
        assertEquals("tenant-123", schoolDataDto.getTenantId());
        assertEquals("Colegio San José", schoolDataDto.getInstitution());
        assertEquals("10-A", schoolDataDto.getCourse());
        assertEquals("A", schoolDataDto.getCalendar());
        assertEquals("Mañana", schoolDataDto.getShift());
    }

    @Test
    void testSchoolDataDto_noArgsConstructor_shouldCreateEmptyObject() {
        // Arrange & Act
        SchoolDataDto schoolDataDto = new SchoolDataDto();

        // Assert
        assertNotNull(schoolDataDto);
        assertNull(schoolDataDto.getSchoolDataId());
        assertNull(schoolDataDto.getMemberId());
        assertNull(schoolDataDto.getTenantId());
        assertNull(schoolDataDto.getInstitution());
        assertNull(schoolDataDto.getCourse());
        assertNull(schoolDataDto.getCalendar());
        assertNull(schoolDataDto.getShift());
    }

    @Test
    void testSchoolDataDto_allArgsConstructor_shouldWork() {
        // Arrange & Act
        SchoolDataDto schoolDataDto = new SchoolDataDto(
                1L,
                100L,
                "tenant-123",
                "Colegio San José",
                "10-A",
                "A",
                "Mañana"
        );

        // Assert
        assertNotNull(schoolDataDto);
        assertEquals(1L, schoolDataDto.getSchoolDataId());
        assertEquals(100L, schoolDataDto.getMemberId());
        assertEquals("tenant-123", schoolDataDto.getTenantId());
        assertEquals("Colegio San José", schoolDataDto.getInstitution());
        assertEquals("10-A", schoolDataDto.getCourse());
        assertEquals("A", schoolDataDto.getCalendar());
        assertEquals("Mañana", schoolDataDto.getShift());
    }

    @Test
    void testSchoolDataDto_gettersAndSetters_shouldWork() {
        // Arrange
        SchoolDataDto schoolDataDto = new SchoolDataDto();

        // Act
        schoolDataDto.setSchoolDataId(1L);
        schoolDataDto.setMemberId(100L);
        schoolDataDto.setTenantId("tenant-123");
        schoolDataDto.setInstitution("Colegio San José");
        schoolDataDto.setCourse("10-A");
        schoolDataDto.setCalendar("A");
        schoolDataDto.setShift("Mañana");

        // Assert
        assertEquals(1L, schoolDataDto.getSchoolDataId());
        assertEquals(100L, schoolDataDto.getMemberId());
        assertEquals("tenant-123", schoolDataDto.getTenantId());
        assertEquals("Colegio San José", schoolDataDto.getInstitution());
        assertEquals("10-A", schoolDataDto.getCourse());
        assertEquals("A", schoolDataDto.getCalendar());
        assertEquals("Mañana", schoolDataDto.getShift());
    }

    @Test
    void testSchoolDataDto_withNullValues_shouldBeAllowed() {
        // Arrange & Act
        SchoolDataDto schoolDataDto = SchoolDataDto.builder()
                .schoolDataId(null)
                .memberId(null)
                .tenantId(null)
                .institution(null)
                .course(null)
                .calendar(null)
                .shift(null)
                .build();

        // Assert
        assertNotNull(schoolDataDto);
        assertNull(schoolDataDto.getSchoolDataId());
        assertNull(schoolDataDto.getMemberId());
        assertNull(schoolDataDto.getTenantId());
        assertNull(schoolDataDto.getInstitution());
        assertNull(schoolDataDto.getCourse());
        assertNull(schoolDataDto.getCalendar());
        assertNull(schoolDataDto.getShift());
    }

    @Test
    void testSchoolDataDto_equals_shouldWorkCorrectly() {
        // Arrange
        SchoolDataDto dto1 = SchoolDataDto.builder()
                .schoolDataId(1L)
                .memberId(100L)
                .tenantId("tenant-123")
                .institution("Colegio A")
                .course("10-A")
                .build();

        SchoolDataDto dto2 = SchoolDataDto.builder()
                .schoolDataId(1L)
                .memberId(100L)
                .tenantId("tenant-123")
                .institution("Colegio A")
                .course("10-A")
                .build();

        SchoolDataDto dto3 = SchoolDataDto.builder()
                .schoolDataId(2L)
                .memberId(200L)
                .tenantId("tenant-456")
                .institution("Colegio B")
                .course("11-B")
                .build();

        // Assert
        assertEquals(dto1, dto2);
        assertNotEquals(dto1, dto3);
    }

    @Test
    void testSchoolDataDto_hashCode_shouldBeConsistent() {
        // Arrange
        SchoolDataDto dto1 = SchoolDataDto.builder()
                .schoolDataId(1L)
                .memberId(100L)
                .tenantId("tenant-123")
                .institution("Colegio A")
                .build();

        SchoolDataDto dto2 = SchoolDataDto.builder()
                .schoolDataId(1L)
                .memberId(100L)
                .tenantId("tenant-123")
                .institution("Colegio A")
                .build();

        // Assert
        assertEquals(dto1.hashCode(), dto2.hashCode());
    }

    @Test
    void testSchoolDataDto_toString_shouldContainAllFields() {
        // Arrange
        SchoolDataDto schoolDataDto = SchoolDataDto.builder()
                .schoolDataId(1L)
                .memberId(100L)
                .tenantId("tenant-123")
                .institution("Colegio San José")
                .course("10-A")
                .calendar("A")
                .shift("Mañana")
                .build();

        // Act
        String toString = schoolDataDto.toString();

        // Assert
        assertNotNull(toString);
        assertTrue(toString.contains("1"));
        assertTrue(toString.contains("100"));
        assertTrue(toString.contains("tenant-123"));
        assertTrue(toString.contains("Colegio San José"));
        assertTrue(toString.contains("10-A"));
        assertTrue(toString.contains("A"));
        assertTrue(toString.contains("Mañana"));
    }

    @Test
    void testSchoolDataDto_withOnlyMandatoryFields_shouldWork() {
        // Arrange & Act
        SchoolDataDto schoolDataDto = SchoolDataDto.builder()
                .memberId(100L)
                .tenantId("tenant-123")
                .build();

        // Assert
        assertNotNull(schoolDataDto);
        assertEquals(100L, schoolDataDto.getMemberId());
        assertEquals("tenant-123", schoolDataDto.getTenantId());
        assertNull(schoolDataDto.getInstitution());
        assertNull(schoolDataDto.getCourse());
    }

    @Test
    void testSchoolDataDto_multipleInstances_shouldBeIndependent() {
        // Arrange
        SchoolDataDto dto1 = SchoolDataDto.builder()
                .memberId(100L)
                .institution("Colegio A")
                .build();

        SchoolDataDto dto2 = SchoolDataDto.builder()
                .memberId(200L)
                .institution("Colegio B")
                .build();

        // Act
        dto1.setCourse("10-A");
        dto2.setCourse("11-B");

        // Assert
        assertEquals("10-A", dto1.getCourse());
        assertEquals("11-B", dto2.getCourse());
        assertNotEquals(dto1.getMemberId(), dto2.getMemberId());
        assertNotEquals(dto1.getInstitution(), dto2.getInstitution());
    }

    @Test
    void testSchoolDataDto_withDifferentShifts_shouldBeValid() {
        // Arrange & Act & Assert
        String[] shifts = {"Mañana", "Tarde", "Noche", "Completa"};

        for (String shift : shifts) {
            SchoolDataDto dto = SchoolDataDto.builder()
                    .memberId(100L)
                    .tenantId("tenant-123")
                    .shift(shift)
                    .build();

            assertNotNull(dto);
            assertEquals(shift, dto.getShift());
        }
    }

    @Test
    void testSchoolDataDto_withDifferentCalendars_shouldBeValid() {
        // Arrange & Act & Assert
        String[] calendars = {"A", "B"};

        for (String calendar : calendars) {
            SchoolDataDto dto = SchoolDataDto.builder()
                    .memberId(100L)
                    .tenantId("tenant-123")
                    .calendar(calendar)
                    .build();

            assertNotNull(dto);
            assertEquals(calendar, dto.getCalendar());
        }
    }

    @Test
    void testSchoolDataDto_builderChaining_shouldWork() {
        // Arrange & Act
        SchoolDataDto schoolDataDto = SchoolDataDto.builder()
                .schoolDataId(1L)
                .memberId(100L)
                .tenantId("tenant-123")
                .institution("Colegio San José")
                .course("10-A")
                .calendar("A")
                .shift("Mañana")
                .build();

        // Assert
        assertNotNull(schoolDataDto);
        assertAll("Verificar todos los campos",
                () -> assertEquals(1L, schoolDataDto.getSchoolDataId()),
                () -> assertEquals(100L, schoolDataDto.getMemberId()),
                () -> assertEquals("tenant-123", schoolDataDto.getTenantId()),
                () -> assertEquals("Colegio San José", schoolDataDto.getInstitution()),
                () -> assertEquals("10-A", schoolDataDto.getCourse()),
                () -> assertEquals("A", schoolDataDto.getCalendar()),
                () -> assertEquals("Mañana", schoolDataDto.getShift())
        );
    }
}