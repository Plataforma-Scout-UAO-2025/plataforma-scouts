package uao.edu.co.scouts_project.infrastructure.auth0;

import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.client.mgmt.OrganizationsEntity;
import com.auth0.json.mgmt.organizations.Organization;
import com.auth0.net.Request;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import com.auth0.exception.APIException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class Auth0OrganizationAdapterTest {

    @Test
    void createOrganization_happyPath_returnsCreatedId_andBuildsPayload() throws Exception {
        // Mocks de SDK
        ManagementAPI api = mock(ManagementAPI.class);
        OrganizationsEntity orgs = mock(OrganizationsEntity.class);
        @SuppressWarnings("unchecked")
        Request<Organization> request = (Request<Organization>) mock(Request.class);

        Organization created = mock(Organization.class);
        when(created.getId()).thenReturn("org_123");

        when(api.organizations()).thenReturn(orgs);
        ArgumentCaptor<Organization> captor = ArgumentCaptor.forClass(Organization.class);
        when(orgs.create(captor.capture())).thenReturn(request);
        when(request.execute()).thenReturn(created);

        // Adapter con api() sobreescrito para inyectar el mock
        Auth0OrganizationAdapter adapter = new Auth0OrganizationAdapter(new Auth0ManagementClientProvider("d","i","s","a")) {
            @Override
            protected ManagementAPI api() {
                return api;
            }
        };

        String id = adapter.createOrganization("Visionarios-113", "https://example.com/logo.png");
        assertEquals("org_123", id);

        // Verificar payload construido
        Organization sent = captor.getValue();
        assertNotNull(sent);
        assertEquals("api-visionarios113", sent.getName());
        assertEquals("Visionarios-113", sent.getDisplayName());
        assertNotNull(sent.getBranding());
        assertEquals("https://example.com/logo.png", sent.getBranding().getLogoUrl());
    }

    @Test
    void createOrganization_conflict409_throwsAlreadyExists() throws Exception {
        ManagementAPI api = mock(ManagementAPI.class);
        OrganizationsEntity orgs = mock(OrganizationsEntity.class);
        @SuppressWarnings("unchecked")
        Request<Organization> request = (Request<Organization>) mock(Request.class);

        when(api.organizations()).thenReturn(orgs);
        when(orgs.create(any(Organization.class))).thenReturn(request);

        APIException conflict = mock(APIException.class);
        when(conflict.getStatusCode()).thenReturn(409);
        when(conflict.getMessage()).thenReturn("conflict");
        when(request.execute()).thenThrow(conflict);

        Auth0OrganizationAdapter adapter = new Auth0OrganizationAdapter(new Auth0ManagementClientProvider("d","i","s","a")) {
            @Override
            protected ManagementAPI api() {
                return api;
            }
        };

        assertThrows(uao.edu.co.scouts_project.domain.exception.auth0.OrganizationAlreadyExistsException.class,
                () -> adapter.createOrganization("Visionarios-113", null));
    }

    @Test
    void createOrganization_retry429_thenSuccess() throws Exception {
        ManagementAPI api = mock(ManagementAPI.class);
        OrganizationsEntity orgs = mock(OrganizationsEntity.class);
        @SuppressWarnings("unchecked")
        Request<Organization> request = (Request<Organization>) mock(Request.class);

        when(api.organizations()).thenReturn(orgs);
        when(orgs.create(any(Organization.class))).thenReturn(request);

        APIException tooMany = mock(APIException.class);
        when(tooMany.getStatusCode()).thenReturn(429);
        when(tooMany.getMessage()).thenReturn("rate limited");

        Organization created = mock(Organization.class);
        when(created.getId()).thenReturn("org_retry");

        // primera llamada 429, segunda éxito
        when(request.execute()).thenThrow(tooMany).thenReturn(created);

        Auth0OrganizationAdapter adapter = new Auth0OrganizationAdapter(new Auth0ManagementClientProvider("d","i","s","a")) {
            @Override
            protected ManagementAPI api() {
                return api;
            }
        };

        String id = adapter.createOrganization("Visionarios-113", null);
        assertEquals("org_retry", id);
    }

    @Test
    void createOrganization_retry5xx_exhaustsAndThrowsGateway() throws Exception {
        ManagementAPI api = mock(ManagementAPI.class);
        OrganizationsEntity orgs = mock(OrganizationsEntity.class);
        @SuppressWarnings("unchecked")
        Request<Organization> request = (Request<Organization>) mock(Request.class);

        when(api.organizations()).thenReturn(orgs);
        when(orgs.create(any(Organization.class))).thenReturn(request);

        APIException serverErr = mock(APIException.class);
        when(serverErr.getStatusCode()).thenReturn(502);
        when(serverErr.getMessage()).thenReturn("bad gateway");

        // siempre falla (el adaptador reintentará y finalmente envolverá en Auth0GatewayException)
        when(request.execute()).thenThrow(serverErr);

        Auth0OrganizationAdapter adapter = new Auth0OrganizationAdapter(new Auth0ManagementClientProvider("d","i","s","a")) {
            @Override
            protected ManagementAPI api() {
                return api;
            }
        };

        assertThrows(uao.edu.co.scouts_project.domain.exception.auth0.Auth0GatewayException.class,
                () -> adapter.createOrganization("Visionarios-113", null));
    }
}
