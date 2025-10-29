package uao.edu.co.scouts_project.infrastructure.auth0;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ConnectionPayloadUtilTest {

    @Test
    void normalizeNameFromSlug_basic() {
        String name = ConnectionPayloadUtil.normalizeNameFromSlug("MiSlug");
        assertEquals("uep-MiSlug", name);
    }

    @Test
    void normalizePasswordPolicy_invalidFallbacksToGood() {
        String p = ConnectionPayloadUtil.normalizePasswordPolicy("INVALID");
        assertEquals("good", p);
    }

    @Test
    void parseEnabledClients_trimsDedupsAndFiltersEmpty() {
        List<String> clients = ConnectionPayloadUtil.parseEnabledClients(" a , ,b,a , c  ");
        assertEquals(List.of("a", "b", "c"), clients);
    }

    @Test
    void buildAndValidateOptions_succeeds() {
        Map<String, Object> options = ConnectionPayloadUtil.buildOptions("good", false);
        assertNotNull(options);
        // No debe lanzar
        ConnectionPayloadUtil.validateOptions(options);
    }
}

