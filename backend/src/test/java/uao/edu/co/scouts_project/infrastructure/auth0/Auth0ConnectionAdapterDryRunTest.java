package uao.edu.co.scouts_project.infrastructure.auth0;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class Auth0ConnectionAdapterDryRunTest {

    @Test
    void dryRunReturnsPseudoIdAndDoesNotThrow() {
        // Provider dummy (no debe ser usado en dry-run)
        Auth0ManagementClientProvider provider = new Auth0ManagementClientProvider("dummy", "id", "secret", "aud") {
        };
        Auth0ConnectionAdapter svc = new Auth0ConnectionAdapter(provider);

        // Setear propiedades privadas
        ReflectionTestUtils.setField(svc, "passwordPolicy", "good");
        ReflectionTestUtils.setField(svc, "enabledClientsCsv", "cli1, cli2");
        ReflectionTestUtils.setField(svc, "disableSignup", true);
        ReflectionTestUtils.setField(svc, "dryRun", true);

        String id = svc.createOrUpdateAuth0DbConnection("SlugX");
        assertEquals("uep-slugx", id); // pseudo-id = name
    }

    @Test
    void emptyEnabledClientsAfterParse_throws() {
        Auth0ManagementClientProvider provider = new Auth0ManagementClientProvider("dummy", "id", "secret", "aud") {
        };
        Auth0ConnectionAdapter svc = new Auth0ConnectionAdapter(provider);
        ReflectionTestUtils.setField(svc, "passwordPolicy", "good");
        ReflectionTestUtils.setField(svc, "enabledClientsCsv", " , ,  ");
        ReflectionTestUtils.setField(svc, "disableSignup", false);
        ReflectionTestUtils.setField(svc, "dryRun", true);

        assertThrows(IllegalArgumentException.class, () -> svc.createOrUpdateAuth0DbConnection("slug"));
    }
}

