package uao.edu.co.scouts_project.infrastructure.auth0;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.exception.APIException;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.mgmt.organizations.EnabledConnection;
import com.auth0.json.mgmt.organizations.Organization;
import com.auth0.net.Request;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import uao.edu.co.scouts_project.domain.exception.auth0.ResourceNotFoundException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class Auth0OrganizationAdapterTest {

    private Auth0ManagementClientProvider provider;
    private ManagementAPI managementAPI;
    private com.auth0.client.mgmt.OrganizationsEntity organizationsEntity;
    private Auth0OrganizationAdapter adapter;

    @BeforeEach
    void setUp() throws Auth0Exception {
        provider = mock(Auth0ManagementClientProvider.class);
        managementAPI = mock(ManagementAPI.class);
        organizationsEntity = mock(com.auth0.client.mgmt.OrganizationsEntity.class);
        when(provider.getManagementAPI()).thenReturn(managementAPI);
        when(managementAPI.organizations()).thenReturn(organizationsEntity);
        adapter = new Auth0OrganizationAdapter(provider);
    }

    @Test
    void enableConnection_success_add() throws Auth0Exception {
        String orgId = "org_123";
        String connId = "conn_456";

        // GET org OK
        @SuppressWarnings("unchecked")
        Request<Organization> getReq = mock(Request.class);
        when(organizationsEntity.get(eq(orgId))).thenReturn(getReq);
        when(getReq.execute()).thenReturn(new Organization());

        // ADD enabled connection OK
        @SuppressWarnings({"rawtypes", "unchecked"})
        Request addReq = mock(Request.class);
        when(organizationsEntity.addConnection(eq(orgId), any(EnabledConnection.class))).thenReturn((Request) addReq);
        when(addReq.execute()).thenReturn(null);

        String result = adapter.enableConnectionForOrganization(orgId, connId);
        assertEquals(connId, result);

        // Capturar payload para validar flags
        ArgumentCaptor<EnabledConnection> captor = ArgumentCaptor.forClass(EnabledConnection.class);
        verify(organizationsEntity).addConnection(eq(orgId), captor.capture());
        EnabledConnection payload = captor.getValue();
        assertEquals(connId, payload.getConnectionId());
        assertTrue(payload.isAssignMembershipOnLogin());
        assertInstanceOf(EnabledConnectionPayload.class, payload);
        EnabledConnectionPayload ext = (EnabledConnectionPayload) payload;
        assertEquals(Boolean.TRUE, ext.getIsSignupEnabled());
        assertEquals(Boolean.TRUE, ext.getShowAsButton());
    }

    @Test
    void enableConnection_orgNotFound_throwsResourceNotFound() throws Auth0Exception {
        String orgId = "org_missing";
        String connId = "conn_456";

        @SuppressWarnings("unchecked")
        Request<Organization> getReq = mock(Request.class);
        when(organizationsEntity.get(eq(orgId))).thenReturn(getReq);

        APIException api404 = mock(APIException.class);
        when(api404.getStatusCode()).thenReturn(404);
        when(api404.getMessage()).thenReturn("Not Found");
        when(getReq.execute()).thenThrow(api404);

        assertThrows(ResourceNotFoundException.class, () -> adapter.enableConnectionForOrganization(orgId, connId));
        verify(organizationsEntity, never()).addConnection(anyString(), any());
    }

    @Test
    void enableConnection_connectionNotFound_throwsResourceNotFound() throws Auth0Exception {
        String orgId = "org_123";
        String connId = "conn_missing";

        // GET org OK
        @SuppressWarnings("unchecked")
        Request<Organization> getReq = mock(Request.class);
        when(organizationsEntity.get(eq(orgId))).thenReturn(getReq);
        when(getReq.execute()).thenReturn(new Organization());

        // ADD 404
        @SuppressWarnings({"rawtypes", "unchecked"})
        Request addReq = mock(Request.class);
        when(organizationsEntity.addConnection(eq(orgId), any(EnabledConnection.class))).thenReturn((Request) addReq);
        APIException api404 = mock(APIException.class);
        when(api404.getStatusCode()).thenReturn(404);
        when(api404.getMessage()).thenReturn("Not Found");
        when(addReq.execute()).thenThrow(api404);

        assertThrows(ResourceNotFoundException.class, () -> adapter.enableConnectionForOrganization(orgId, connId));
    }

    @Test
    void enableConnection_alreadyEnabled_updatesFlagsAndSucceeds() throws Auth0Exception {
        String orgId = "org_123";
        String connId = "conn_456";

        // GET org OK
        @SuppressWarnings("unchecked")
        Request<Organization> getReq = mock(Request.class);
        when(organizationsEntity.get(eq(orgId))).thenReturn(getReq);
        when(getReq.execute()).thenReturn(new Organization());

        // ADD 409
        @SuppressWarnings({"rawtypes", "unchecked"})
        Request addReq = mock(Request.class);
        when(organizationsEntity.addConnection(eq(orgId), any(EnabledConnection.class))).thenReturn((Request) addReq);
        APIException api409 = mock(APIException.class);
        when(api409.getStatusCode()).thenReturn(409);
        when(api409.getMessage()).thenReturn("Conflict");
        when(addReq.execute()).thenThrow(api409);

        // UPDATE OK
        @SuppressWarnings({"rawtypes", "unchecked"})
        Request updateReq = mock(Request.class);
        when(organizationsEntity.updateConnection(eq(orgId), eq(connId), any(EnabledConnection.class))).thenReturn((Request) updateReq);
        when(updateReq.execute()).thenReturn(null);

        String result = adapter.enableConnectionForOrganization(orgId, connId);
        assertEquals(connId, result);

        ArgumentCaptor<EnabledConnection> updateCaptor = ArgumentCaptor.forClass(EnabledConnection.class);
        verify(organizationsEntity).updateConnection(eq(orgId), eq(connId), updateCaptor.capture());
        EnabledConnection updatePayload = updateCaptor.getValue();
        assertNull(updatePayload.getConnectionId()); // no se establece en update
        assertTrue(updatePayload.isAssignMembershipOnLogin());
        assertTrue(updatePayload instanceof EnabledConnectionPayload);
        EnabledConnectionPayload ext = (EnabledConnectionPayload) updatePayload;
        assertEquals(Boolean.TRUE, ext.getIsSignupEnabled());
        assertEquals(Boolean.TRUE, ext.getShowAsButton());
    }

    @Test
    void enableConnection_retryOn429_thenSuccess() throws Auth0Exception {
        String orgId = "org_123";
        String connId = "conn_456";

        // GET org OK
        @SuppressWarnings("unchecked")
        Request<Organization> getReq = mock(Request.class);
        when(organizationsEntity.get(eq(orgId))).thenReturn(getReq);
        when(getReq.execute()).thenReturn(new Organization());

        // ADD first 429, then 200
        @SuppressWarnings({"rawtypes", "unchecked"})
        Request addReq = mock(Request.class);
        when(organizationsEntity.addConnection(eq(orgId), any(EnabledConnection.class))).thenReturn((Request) addReq);
        APIException api429 = mock(APIException.class);
        when(api429.getStatusCode()).thenReturn(429);
        when(api429.getMessage()).thenReturn("Too Many Requests");
        when(addReq.execute()).thenThrow(api429).thenReturn(null);

        String result = adapter.enableConnectionForOrganization(orgId, connId);
        assertEquals(connId, result);

        verify(organizationsEntity, atLeastOnce()).addConnection(eq(orgId), any(EnabledConnection.class));
        verify(addReq, times(2)).execute();
    }

    @Test
    void enableConnection_invalidInputs_throwIllegalArgument() {
        assertThrows(IllegalArgumentException.class, () -> adapter.enableConnectionForOrganization(" ", "conn"));
        assertThrows(IllegalArgumentException.class, () -> adapter.enableConnectionForOrganization("org", ""));
        assertThrows(IllegalArgumentException.class, () -> adapter.enableConnectionForOrganization(null, "conn"));
        assertThrows(IllegalArgumentException.class, () -> adapter.enableConnectionForOrganization("org", null));
    }
}
