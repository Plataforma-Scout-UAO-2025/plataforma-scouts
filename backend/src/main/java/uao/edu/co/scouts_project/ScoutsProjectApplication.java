package uao.edu.co.scouts_project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ScoutsProjectApplication {

	public static void main(String[] args) {

        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing() // No fallar si el archivo .env no existe
                    .load();
            dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue())); // Traer variables de entorno
        } catch (Exception e) {
            // En entornos CI/CD o producción, las variables se configuran directamente
            System.out.println("No .env file found, using environment variables directly");
        }

		SpringApplication.run(ScoutsProjectApplication.class, args);
	}

}
