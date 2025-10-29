package uao.edu.co.scouts_project.infrastructure.auth0;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class OrganizationPayloadUtilTest {

    @Test
    void buildNameFromDisplayName_basicNormalization() {
        String name = OrganizationPayloadUtil.buildNameFromDisplayName("Visionarios-113");
        assertEquals("api-visionarios113", name);
    }

    @Test
    void buildNameFromDisplayName_trimsLowercasesAndRemovesNonAlnum() {
        String name = OrganizationPayloadUtil.buildNameFromDisplayName("  ViSiOnArIos_  113***  ");
        // remove non [a-z0-9]: underscores, spaces, stars
        assertEquals("api-visionarios113", name);
    }

    @Test
    void buildNameFromDisplayName_truncatesTo45() {
        String display = "ABCDEF".repeat(50); // 300 chars
        // after toLowerCase and removing non-alnum, still letters a-f, so length 300 -> trunc to 45
        String name = OrganizationPayloadUtil.buildNameFromDisplayName(display);
        assertTrue(name.startsWith("api-"));
        String suffix = name.substring(4);
        assertEquals(45, suffix.length());
        assertTrue(suffix.matches("[a-z0-9]{45}"));
    }

    @Test
    void buildNameFromDisplayName_throwsWhenEmptyAfterNormalization() {
        // only non-alnum characters which will be removed
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> OrganizationPayloadUtil.buildNameFromDisplayName(" --__ ** "));
        assertTrue(ex.getMessage().toLowerCase().contains("no produce un nombre normalizado"));
    }

    @Test
    void buildNameFromDisplayName_nullOrEmptyOrTooLong() {
        assertThrows(IllegalArgumentException.class, () -> OrganizationPayloadUtil.buildNameFromDisplayName(null));
        assertThrows(IllegalArgumentException.class, () -> OrganizationPayloadUtil.buildNameFromDisplayName("   "));
    }

    @Test
    void normalizeLogoUrlOrNull_acceptsNullOrEmpty() {
        assertNull(OrganizationPayloadUtil.normalizeLogoUrlOrNull(null));
        assertNull(OrganizationPayloadUtil.normalizeLogoUrlOrNull("   "));
    }

    @Test
    void normalizeLogoUrlOrNull_requiresHttps() {
        assertThrows(IllegalArgumentException.class, () -> OrganizationPayloadUtil.normalizeLogoUrlOrNull("http://example.com/a.png"));
        assertDoesNotThrow(() -> OrganizationPayloadUtil.normalizeLogoUrlOrNull("https://cdn.example.com/a.png"));
    }

    @Test
    void buildRequestBodyMap_includesBrandingOnlyWhenLogoPresent() {
        Map<String, Object> body1 = OrganizationPayloadUtil.buildRequestBodyMap("Visionarios-113", null);
        assertEquals("api-visionarios113", body1.get("name"));
        assertEquals("Visionarios-113", body1.get("display_name"));
        assertNull(body1.get("branding"));

        Map<String, Object> body2 = OrganizationPayloadUtil.buildRequestBodyMap("Visionarios-113", "https://example.com/logo.png");
        assertEquals("api-visionarios113", body2.get("name"));
        assertEquals("Visionarios-113", body2.get("display_name"));
        @SuppressWarnings("unchecked")
        Map<String, Object> branding = (Map<String, Object>) body2.get("branding");
        assertNotNull(branding);
        assertEquals("https://example.com/logo.png", branding.get("logo_url"));
    }
}

