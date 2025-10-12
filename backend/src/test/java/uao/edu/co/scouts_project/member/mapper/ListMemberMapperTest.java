package uao.edu.co.scouts_project.member.mapper;

import org.junit.jupiter.api.Test;
import uao.edu.co.scouts_project.member.dto.ListMemberDto;
import uao.edu.co.scouts_project.member.model.Member;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.lang.reflect.InvocationTargetException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ListMemberMapperTest {

    @Test
    void testToDto_withValidMember_shouldMapCorrectly() {
        Member.EmergencyContact contact = Member.EmergencyContact.builder()
                .name("Carlos")
                .relationship("Padre")
                .phone("123456789")
                .build();

        Member member = Member.builder()
                .memberId(1L)
                .userId("user1")
                .tenantId("tenant1")
                .guardianId(3)
                .firstName("Juan")
                .lastName("Pérez")
                .age(15)
                .role("Scout")
                .identification("12345")
                .documentType(DocumentType.TI)
                .email("juan@correo.com")
                .gender("M")
                .birthDate(LocalDate.of(2010, 5, 12))
                .address("Calle 1")
                .phone("3001234567")
                .weight("50.5")
                .height("1.60")
                .hobbies("Leer")
                .sports("Fútbol")
                .instruments("Guitarra")
                .isActive(true)
                .relationship("Ninguna")
                .status(Status.APPROVED)
                .acceptanceDate(LocalDate.of(2020, 1, 1))
                .emergencyContacts(List.of(contact))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ListMemberDto dto = ListMemberMapper.toDto(member);

        assertNotNull(dto);
        assertEquals("Juan", dto.getFirst_name());
        assertEquals("Padre", dto.getEmergency_contacts().get(0).getRelationship());
    }

    @Test
    void testToDto_withNullMember_shouldReturnNull() {
        assertNull(ListMemberMapper.toDto(null));
    }

    @Test
    void testToDtoList_withValidList_shouldMapAll() {
        Member member = Member.builder().firstName("Ana").build();
        List<ListMemberDto> result = ListMemberMapper.toDtoList(List.of(member));

        assertEquals(1, result.size());
        assertEquals("Ana", result.get(0).getFirst_name());
    }

    @Test
    void testToDtoList_withNullList_shouldReturnEmpty() {
        List<ListMemberDto> result = ListMemberMapper.toDtoList(null);
        assertTrue(result.isEmpty());
    }

    @Test
    void testPrivateConstructor_shouldThrowException() throws Exception {
        var constructor = ListMemberMapper.class.getDeclaredConstructor();
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
