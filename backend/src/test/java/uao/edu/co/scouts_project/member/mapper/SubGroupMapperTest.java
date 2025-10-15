package uao.edu.co.scouts_project.member.mapper;

import org.junit.jupiter.api.Test;
import uao.edu.co.scouts_project.organigrama.dto.SubgroupDTO;
import uao.edu.co.scouts_project.organigrama.model.Subgroup;

import java.lang.reflect.InvocationTargetException;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SubGroupMapperTest {

    @Test
    void testToDto_withValidEntity_shouldMapCorrectly() {
        Subgroup subgroup = new Subgroup();
        subgroup.setSubgroupId(5L);
        subgroup.setName("Leones");
        subgroup.setDescription("Subgrupo de Scouts jóvenes");

        SubgroupDTO dto = SubGroupMapper.toDto(subgroup);

        assertNotNull(dto);
        assertEquals("Leones", dto.name());
        assertEquals("Subgrupo de Scouts jóvenes", dto.description());
    }

    @Test
    void testToDto_withNullEntity_shouldReturnNull() {
        assertNull(SubGroupMapper.toDto(null));
    }

    @Test
    void testToEntity_withValidDto_shouldMapCorrectly() {
        SubgroupDTO dto = new SubgroupDTO(
                1L,               // subgroupId
                "tenant-123",     // tenantId
                2L,               // groupId
                3L,               // sectionId
                "Águilas",        // name
                "Subgrupo de exploradores avanzados", // description
                UUID.randomUUID(), // photoPrincipal
                true,              // isActive
                Instant.now(),     // createdAt
                Instant.now()      // updatedAt
        );

        Subgroup entity = SubGroupMapper.toEntity(dto);

        assertNotNull(entity);
        assertEquals("Águilas", entity.getName());
    }

    @Test
    void testToEntity_withNullDto_shouldReturnNull() {
        assertNull(SubGroupMapper.toEntity(null));
    }

    @Test
    void testPrivateConstructor_shouldThrowException() throws Exception {
        var constructor = SubGroupMapper.class.getDeclaredConstructor();
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
