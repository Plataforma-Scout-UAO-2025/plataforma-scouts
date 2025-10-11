package uao.edu.co.scouts_project.member.mapper;

import org.junit.jupiter.api.Test;
import uao.edu.co.scouts_project.member.dto.SchoolDataDto;
import uao.edu.co.scouts_project.member.model.SchoolData;

import java.lang.reflect.InvocationTargetException;

import static org.junit.jupiter.api.Assertions.*;

class SchoolDataMapperTest {

    @Test
    void testToDto_withValidEntity_shouldMapCorrectly() {
        SchoolData schoolData = SchoolData.builder()
                .schoolDataId(1L)
                .memberId(100L)
                .tenantId("tenant-01")
                .institution("Colegio UAO")
                .course("10°")
                .calendar("A")
                .shift("Mañana")
                .build();

        SchoolDataDto dto = SchoolDataMapper.toDto(schoolData);

        assertNotNull(dto);
        assertEquals("Colegio UAO", dto.getInstitution());
        assertEquals("10°", dto.getCourse());
        assertEquals("A", dto.getCalendar());
        assertEquals("Mañana", dto.getShift());
    }

    @Test
    void testToDto_withNullEntity_shouldReturnNull() {
        assertNull(SchoolDataMapper.toDto(null));
    }

    @Test
    void testToEntity_withValidDto_shouldMapCorrectly() {
        SchoolDataDto dto = SchoolDataDto.builder()
                .schoolDataId(2L)
                .institution("Instituto ABC")
                .course("11°")
                .calendar("B")
                .shift("Tarde")
                .build();

        Long memberId = 10L;
        String tenantId = "tenant-02";

        SchoolData entity = SchoolDataMapper.toEntity(dto, memberId, tenantId);

        assertNotNull(entity);
        assertEquals("Instituto ABC", entity.getInstitution());
        assertEquals("11°", entity.getCourse());
        assertEquals("Tarde", entity.getShift());
        assertEquals(memberId, entity.getMemberId());
        assertEquals(tenantId, entity.getTenantId());
    }

    @Test
    void testToEntity_withNullDto_shouldReturnNull() {
        assertNull(SchoolDataMapper.toEntity(null, 1L, "tenant-x"));
    }

    @Test
    void testPrivateConstructor_shouldThrowException() throws Exception {
        var constructor = SchoolDataMapper.class.getDeclaredConstructor();
        constructor.setAccessible(true);

        InvocationTargetException exception = assertThrows(
            InvocationTargetException.class,
            constructor::newInstance
        );

        Throwable cause = exception.getCause();
        assertTrue(cause instanceof IllegalStateException);
        assertEquals("Utility class", cause.getMessage());
    }
}
