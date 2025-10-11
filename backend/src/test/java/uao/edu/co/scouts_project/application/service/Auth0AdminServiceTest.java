package uao.edu.co.scouts_project.application.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uao.edu.co.scouts_project.domain.port.Auth0AdminPort;
import uao.edu.co.scouts_project.domain.dto.auth0.CreatedUserDTO;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Auth0AdminServiceTest {

    @Mock
    private Auth0AdminPort port;

    @InjectMocks
    private Auth0AdminService service;

    @Test
    void createUserDelegatesAndReturnsDto() {
        when(port.createUser(any())).thenReturn(new CreatedUserDTO("id123", "mail@test.com", "userX", false));
        CreatedUserDTO created = service.createUser("mail@test.com", "123456", "userX");
        assertEquals("id123", created.getId());
        verify(port, times(1)).createUser(any());
    }

    @Test
    void assignRoleValidatesArguments() {
        service.assignRole("u1", "r1");
        verify(port).assignRole("u1", "r1");
        assertThrows(IllegalArgumentException.class, () -> service.assignRole("", "r1"));
        assertThrows(IllegalArgumentException.class, () -> service.assignRole("u1", ""));
    }

    @Test
    void verifyConnectivityTrueWhenNoException() {
        when(port.countRoles()).thenReturn(5);
        assertTrue(service.verifyConnectivity());
    }

    @Test
    void verifyConnectivityFalseOnException() {
        when(port.countRoles()).thenThrow(new RuntimeException("boom"));
        assertFalse(service.verifyConnectivity());
    }
}
