package uao.edu.co.scouts_project.organigrama.service;

import uao.edu.co.scouts_project.organigrama.dto.TenantDTO;
import uao.edu.co.scouts_project.organigrama.model.Tenant;
import uao.edu.co.scouts_project.organigrama.repository.TenantRepository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests puros del servicio usando JUnit 5 + MockitoExtension
 * (sin contexto de Spring) — patrón recomendado.
 */
@ExtendWith(MockitoExtension.class) // Inicializa @Mock y @InjectMocks (JUnit 5)
@DisplayName("TenantService (unit)")
class TenantServiceTest {

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private TenantService tenantService;

    private Tenant newTenantEntity(String slug, String status) {
        Tenant t = new Tenant(slug); // asume constructor (slug)
        t.setTenantId("t-" + slug);
        t.setStatus(status);
        t.setCreatedAt(Instant.parse("2025-01-01T00:00:00Z"));
        t.setUpdatedAt(Instant.parse("2025-01-02T00:00:00Z"));
        return t;
    }

    @Test
    @DisplayName("getAllTenants: mapea entidades a DTOs")
    void getAllTenants_ok() {
        Tenant t1 = newTenantEntity("slug-1", "active");
        Tenant t2 = newTenantEntity("slug-2", "inactive");
        when(tenantRepository.findAll()).thenReturn(List.of(t1, t2));

        List<TenantDTO> result = tenantService.getAllTenants();

        assertThat(result)
            .hasSize(2)
            .extracting(TenantDTO::slug)
            .containsExactlyInAnyOrder("slug-1", "slug-2");
        verify(tenantRepository).findAll();
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("getTenantBySlug: retorna DTO si existe")
    void getTenantBySlug_ok() {
        Tenant t = newTenantEntity("region-valle", "active");
        when(tenantRepository.findBySlug("region-valle")).thenReturn(Optional.of(t));

        TenantDTO dto = tenantService.getTenantBySlug("region-valle");

        assertThat(dto.slug()).isEqualTo("region-valle");
        assertThat(dto.status()).isEqualTo("active");
        verify(tenantRepository).findBySlug("region-valle");
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("getTenantBySlug: lanza IllegalArgumentException si no existe")
    void getTenantBySlug_notFound() {
        when(tenantRepository.findBySlug("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tenantService.getTenantBySlug("nope"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("not found");

        verify(tenantRepository).findBySlug("nope");
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("createTenant: lanza IllegalArgumentException si slug duplicado")
    void createTenant_duplicateSlug() {
        TenantDTO incoming = new TenantDTO(null, "region-valle", "active", null, null);
        when(tenantRepository.existsBySlug("region-valle")).thenReturn(true);

        assertThatThrownBy(() -> tenantService.createTenant(incoming))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("already exists");

        verify(tenantRepository).existsBySlug("region-valle");
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("createTenant: crea y retorna DTO si slug libre")
    void createTenant_ok() {
        TenantDTO incoming = new TenantDTO(null, "nuevo-slug", "active", null, null);
        when(tenantRepository.existsBySlug("nuevo-slug")).thenReturn(false);

        Tenant saved = newTenantEntity("nuevo-slug", "active");
        when(tenantRepository.save(any(Tenant.class))).thenReturn(saved);

        TenantDTO out = tenantService.createTenant(incoming);

        assertThat(out.slug()).isEqualTo("nuevo-slug");
        assertThat(out.status()).isEqualTo("active");
        verify(tenantRepository).existsBySlug("nuevo-slug");
        verify(tenantRepository).save(any(Tenant.class));
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("updateTenant: actualiza si existe")
    void updateTenant_ok() {
        Tenant existing = newTenantEntity("slug-x", "inactive");
        when(tenantRepository.findBySlug("slug-x")).thenReturn(Optional.of(existing));

        Tenant afterSave = newTenantEntity("slug-x", "active");
        when(tenantRepository.save(any(Tenant.class))).thenReturn(afterSave);

        TenantDTO patch = new TenantDTO(null, "slug-x", "active", null, null);

        TenantDTO out = tenantService.updateTenant("slug-x", patch);

        assertThat(out.slug()).isEqualTo("slug-x");
        assertThat(out.status()).isEqualTo("active");
        verify(tenantRepository).findBySlug("slug-x");
        verify(tenantRepository).save(any(Tenant.class));
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("updateTenant: lanza IllegalArgumentException si no existe")
    void updateTenant_notFound() {
        when(tenantRepository.findBySlug("missing")).thenReturn(Optional.empty());

        TenantDTO patch = new TenantDTO(null, "missing", "active", null, null);

        assertThatThrownBy(() -> tenantService.updateTenant("missing", patch))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("not found");

        verify(tenantRepository).findBySlug("missing");
        verifyNoMoreInteractions(tenantRepository);
    }

    @Nested
    @DisplayName("deleteTenant")
    class DeleteTenantTests {
        @Test
        @DisplayName("elimina si existe")
        void delete_ok() {
            Tenant t = newTenantEntity("slug-del", "active");
            when(tenantRepository.findBySlug("slug-del")).thenReturn(Optional.of(t));

            tenantService.deleteTenant("slug-del");

            verify(tenantRepository).findBySlug("slug-del");
            verify(tenantRepository).delete(t);
            verifyNoMoreInteractions(tenantRepository);
        }

        @Test
        @DisplayName("lanza IllegalArgumentException si no existe")
        void delete_notFound() {
            when(tenantRepository.findBySlug("nope")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tenantService.deleteTenant("nope"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");

            verify(tenantRepository).findBySlug("nope");
            verifyNoMoreInteractions(tenantRepository);
        }
    }
}
