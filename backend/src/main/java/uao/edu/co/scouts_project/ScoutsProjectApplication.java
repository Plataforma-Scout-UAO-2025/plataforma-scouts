package uao.edu.co.scouts_project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ScoutsProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(ScoutsProjectApplication.class, args);
	}

}
