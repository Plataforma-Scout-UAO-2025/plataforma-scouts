package uao.edu.co.scouts_project;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ScoutsProjectApplication {

	public static void main(String[] args) {

        Dotenv dotenv = Dotenv.load();
        dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue())); // Traer variables de entorno


		SpringApplication.run(ScoutsProjectApplication.class, args);
	}

}
