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
import org.mockito.ArgumentCaptor;
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
    @DisplayName("getTenantById: retorna DTO si existe")
    void getTenantById_ok() {
        Tenant t = newTenantEntity("region-valle", "active");
        when(tenantRepository.findById(t.getTenantId())).thenReturn(Optional.of(t));

        TenantDTO dto = tenantService.getTenantById(t.getTenantId());

        assertThat(dto.slug()).isEqualTo("region-valle");
        assertThat(dto.status()).isEqualTo("active");
        verify(tenantRepository).findById(t.getTenantId());
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("getTenantById: lanza IllegalArgumentException si no existe")
    void getTenantById_notFound() {
        String missingTenantId = "t-nope";
        when(tenantRepository.findById(missingTenantId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tenantService.getTenantById(missingTenantId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("not found");

        verify(tenantRepository).findById(missingTenantId);
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
    @DisplayName("createTenant: usa estado por defecto cuando el DTO no lo envía")
    void createTenant_defaultStatus() {
        TenantDTO incoming = new TenantDTO(null, "default-slug", null, null, null);
        when(tenantRepository.existsBySlug("default-slug")).thenReturn(false);

        when(tenantRepository.save(any(Tenant.class))).thenAnswer(invocation -> {
            Tenant entity = invocation.getArgument(0, Tenant.class);
            entity.setTenantId("t-default-slug");
            return entity;
        });

        TenantDTO out = tenantService.createTenant(incoming);

        ArgumentCaptor<Tenant> captor = ArgumentCaptor.forClass(Tenant.class);
        verify(tenantRepository).save(captor.capture());

        Tenant savedEntity = captor.getValue();
        assertThat(savedEntity.getSlug()).isEqualTo("default-slug");
        assertThat(savedEntity.getStatus()).isEqualTo("active");

        assertThat(out.slug()).isEqualTo("default-slug");
        assertThat(out.status()).isEqualTo("active");
        verify(tenantRepository).existsBySlug("default-slug");
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("updateTenant: actualiza si existe")
    void updateTenant_ok() {
        Tenant existing = newTenantEntity("slug-x", "inactive");
        when(tenantRepository.findById(existing.getTenantId())).thenReturn(Optional.of(existing));

        Tenant afterSave = newTenantEntity("slug-x", "active");
        when(tenantRepository.save(any(Tenant.class))).thenReturn(afterSave);

        TenantDTO patch = new TenantDTO(null, "slug-x", "active", null, null);

        TenantDTO out = tenantService.updateTenant(existing.getTenantId(), patch);

        assertThat(out.slug()).isEqualTo("slug-x");
        assertThat(out.status()).isEqualTo("active");
        verify(tenantRepository).findById(existing.getTenantId());
        verify(tenantRepository).save(any(Tenant.class));
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("updateTenant: lanza IllegalArgumentException si no existe")
    void updateTenant_notFound() {
        when(tenantRepository.findById("t-missing")).thenReturn(Optional.empty());

        TenantDTO patch = new TenantDTO(null, "missing", "active", null, null);

        assertThatThrownBy(() -> tenantService.updateTenant("t-missing", patch))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("not found");

        verify(tenantRepository).findById("t-missing");
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("updateTenant: conserva estado cuando el DTO no envía cambios")
    void updateTenant_keepStatusIfNull() {
        Tenant existing = newTenantEntity("slug-keep", "inactive");
        when(tenantRepository.findById(existing.getTenantId())).thenReturn(Optional.of(existing));

        when(tenantRepository.save(any(Tenant.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TenantDTO patch = new TenantDTO(null, "slug-keep", null, null, null);

        TenantDTO out = tenantService.updateTenant(existing.getTenantId(), patch);

        ArgumentCaptor<Tenant> captor = ArgumentCaptor.forClass(Tenant.class);
        verify(tenantRepository).save(captor.capture());

        Tenant savedEntity = captor.getValue();
        assertThat(savedEntity.getStatus()).isEqualTo("inactive");

        assertThat(out.status()).isEqualTo("inactive");
        verify(tenantRepository).findById(existing.getTenantId());
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("getTenantIdBySlug: retorna tenantId si existe")
    void getTenantIdBySlug_ok() {
        Tenant t = newTenantEntity("slug-login", "active");
        when(tenantRepository.findBySlug("slug-login")).thenReturn(Optional.of(t));

        String tenantId = tenantService.getTenantIdBySlug("slug-login");

        assertThat(tenantId).isEqualTo(t.getTenantId());
        verify(tenantRepository).findBySlug("slug-login");
        verifyNoMoreInteractions(tenantRepository);
    }

    @Test
    @DisplayName("getTenantIdBySlug: lanza IllegalArgumentException si no existe")
    void getTenantIdBySlug_notFound() {
        when(tenantRepository.findBySlug("no-such-slug")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tenantService.getTenantIdBySlug("no-such-slug"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("not found");

        verify(tenantRepository).findBySlug("no-such-slug");
        verifyNoMoreInteractions(tenantRepository);
    }

    @Nested
    @DisplayName("deleteTenant")
    class DeleteTenantTests {
        @Test
        @DisplayName("elimina si existe")
        void delete_ok() {
            Tenant t = newTenantEntity("slug-del", "active");
            when(tenantRepository.findById(t.getTenantId())).thenReturn(Optional.of(t));

            tenantService.deleteTenant(t.getTenantId());

            verify(tenantRepository).findById(t.getTenantId());
            verify(tenantRepository).delete(t);
            verifyNoMoreInteractions(tenantRepository);
        }

        @Test
        @DisplayName("lanza IllegalArgumentException si no existe")
        void delete_notFound() {
            when(tenantRepository.findById("t-nope")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tenantService.deleteTenant("t-nope"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not found");

            verify(tenantRepository).findById("t-nope");
            verifyNoMoreInteractions(tenantRepository);
        }
    }
}
