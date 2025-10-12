package uao.edu.co.scouts_project.member.mapper;

import org.junit.jupiter.api.Test;
import uao.edu.co.scouts_project.member.dto.MemberDto;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;

import static org.junit.jupiter.api.Assertions.*;

class MemberMapperTest {

    @Test
    void testToEntity_withValidDto_shouldMapCorrectly() {
        MemberDto dto = MemberDto.builder()
                .firstName("Pedro")
                .lastName("López")
                .documentType("CC")
                .identification("12345")
                .email("pedro@correo.com")
                .role("Scout")
                .status("PENDING")
                .build();

        Member member = MemberMapper.toEntity(dto);

        assertNotNull(member);
        assertEquals("Pedro", member.getFirstName());
        assertEquals(DocumentType.CC, member.getDocumentType());
    }

    @Test
    void testToEntity_withNullDto_shouldReturnNull() {
        assertNull(MemberMapper.toEntity(null));
    }

    @Test
    void testToDto_withValidEntity_shouldMapCorrectly() {
        Member member = Member.builder()
                .firstName("Laura")
                .lastName("Gómez")
                .role("Guía")
                .email("laura@correo.com")
                .build();

        MemberDto dto = MemberMapper.toDto(member);

        assertNotNull(dto);
        assertEquals("Laura", dto.getFirstName());
        assertEquals("Guía", dto.getRole());
    }

    @Test
    void testToDto_withNullEntity_shouldReturnNull() {
        assertNull(MemberMapper.toDto(null));
    }

    @Test
    void testPrivateConstructor_shouldInstantiateSuccessfully() throws Exception {
        var constructor = MemberMapper.class.getDeclaredConstructor();
        constructor.setAccessible(true);

        Object instance = constructor.newInstance();
        assertNotNull(instance);
    }

}
