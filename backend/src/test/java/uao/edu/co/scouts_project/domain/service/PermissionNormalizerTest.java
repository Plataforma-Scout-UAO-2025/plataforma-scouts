package uao.edu.co.scouts_project.domain.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PermissionNormalizerTest {

    private final PermissionNormalizer normalizer = new PermissionNormalizer();

    @Test
    void normalizePermissionTrimsAndKeepsContent() {
        assertEquals("read:alpha", normalizer.normalizePermission("  read:alpha  "));
    }

    @Test
    void normalizePermissionEmptyOnNullOrBlank() {
        assertEquals("", normalizer.normalizePermission(null));
        assertEquals("", normalizer.normalizePermission("   "));
    }

    @Test
    void normalizeRoleTransforms() {
        assertEquals("ADMIN_ROLE", normalizer.normalizeRole(" admin role "));
    }

    @Test
    void normalizeRoleEmptyOnNullOrBlank() {
        assertEquals("", normalizer.normalizeRole(null));
        assertEquals("", normalizer.normalizeRole("   "));
    }
}

