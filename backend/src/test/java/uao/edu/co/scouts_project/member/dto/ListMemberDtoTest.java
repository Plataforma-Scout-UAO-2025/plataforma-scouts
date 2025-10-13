package uao.edu.co.scouts_project.member.dto;

import org.junit.jupiter.api.Test;
import uao.edu.co.scouts_project.member.shared.enums.DocumentType;
import uao.edu.co.scouts_project.member.shared.enums.Status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ListMemberDtoTest {

    @Test
    void testBuilderAndGetters() {
        LocalDate birthDate = LocalDate.of(2000, 1, 1);
        LocalDate acceptanceDate = LocalDate.of(2020, 1, 1);
        LocalDateTime createdAt = LocalDateTime.now();
        LocalDateTime updatedAt = LocalDateTime.now();

        ListMemberDto.EmergencyContactDto contact = ListMemberDto.EmergencyContactDto.builder()
                .name("Jane Doe")
                .relationship("Madre")
                .phone("123456789")
                .build();

        ListMemberDto dto = ListMemberDto.builder()
                .member_id(1L)
                .user_id("u123")
                .tenant_id("t123")
                .guardian_id(2)
                .first_name("John")
                .last_name("Doe")
                .age(25)
                .role("Scout")
                .identification("987654")
                .document_type(DocumentType.CC)
                .email("john.doe@example.com")
                .gender("M")
                .birth_date(birthDate)
                .address("Calle 123")
                .phone("5551234")
                .weight("70kg")
                .height("1.75m")
                .hobbies("Leer")
                .sports("Fútbol")
                .instruments("Guitarra")
                .is_active(true)
                .relationship("Hermano")
                .status(Status.APPROVED)
                .acceptance_date(acceptanceDate)
                .emergency_contacts(List.of(contact))
                .created_at(createdAt)
                .updated_at(updatedAt)
                .build();

        assertEquals("John", dto.getFirst_name());
        assertEquals("Doe", dto.getLast_name());
        assertEquals("John Doe", dto.getFullName());
        assertEquals(DocumentType.CC, dto.getDocument_type());
        assertEquals(Status.APPROVED, dto.getStatus());
        assertTrue(dto.getIs_active());
        assertEquals("Jane Doe", dto.getEmergency_contacts().get(0).getName());
        assertEquals("Madre", dto.getEmergency_contacts().get(0).getRelationship());
        assertEquals("123456789", dto.getEmergency_contacts().get(0).getPhone());
    }

    @Test
    void testNoArgsConstructorAndSetters() {
        ListMemberDto dto = new ListMemberDto();
        dto.setFirst_name("Alice");
        dto.setLast_name("Smith");

        assertEquals("Alice Smith", dto.getFullName());
    }

    @Test
    void testEmergencyContactDtoAllArgsConstructor() {
        ListMemberDto.EmergencyContactDto contact =
                new ListMemberDto.EmergencyContactDto("Bob", "Padre", "987654321");

        assertEquals("Bob", contact.getName());
        assertEquals("Padre", contact.getRelationship());
        assertEquals("987654321", contact.getPhone());
    }
}
