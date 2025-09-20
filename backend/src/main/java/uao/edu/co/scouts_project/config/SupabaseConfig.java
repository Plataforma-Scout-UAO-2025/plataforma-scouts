package uao.edu.co.scouts_project.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuración para integración con Supabase
 * Incluye configuración para API REST y almacenamiento
 */
@Configuration
public class SupabaseConfig {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.anon.key:}")
    private String supabaseAnonKey;

    @Value("${supabase.service.role.key:}")
    private String supabaseServiceRoleKey;

    @Value("${supabase.storage.bucket:images}")
    private String defaultStorageBucket;

    @Value("${supabase.images.bucket:images}")
    private String imagesBucket;

    @Value("${supabase.files.bucket:files}")
    private String filesBucket;

    @Bean
    public RestTemplate supabaseRestTemplate() {
        return new RestTemplate();
    }

    @Bean
    public SupabaseProperties supabaseProperties() {
        return new SupabaseProperties(
            supabaseUrl,
            supabaseAnonKey,
            supabaseServiceRoleKey,
            defaultStorageBucket,
            imagesBucket,
            filesBucket
        );
    }

    /**
     * Propiedades de configuración de Supabase
     */
    public static class SupabaseProperties {
        private final String url;
        private final String anonKey;
        private final String serviceRoleKey;
        private final String defaultStorageBucket;
        private final String imagesBucket;
        private final String filesBucket;

        public SupabaseProperties(String url, String anonKey, String serviceRoleKey, 
                                  String defaultStorageBucket, String imagesBucket, String filesBucket) {
            this.url = url;
            this.anonKey = anonKey;
            this.serviceRoleKey = serviceRoleKey;
            this.defaultStorageBucket = defaultStorageBucket;
            this.imagesBucket = imagesBucket;
            this.filesBucket = filesBucket;
        }

        public String getUrl() {
            return url;
        }

        public String getAnonKey() {
            return anonKey;
        }

        public String getServiceRoleKey() {
            return serviceRoleKey;
        }

        public String getDefaultStorageBucket() {
            return defaultStorageBucket;
        }

        public String getImagesBucket() {
            return imagesBucket;
        }

        public String getFilesBucket() {
            return filesBucket;
        }

        public String getStorageUrl() {
            return url + "/storage/v1";
        }

        public String getRestUrl() {
            return url + "/rest/v1";
        }

        public String getAuthUrl() {
            return url + "/auth/v1";
        }
    }
}