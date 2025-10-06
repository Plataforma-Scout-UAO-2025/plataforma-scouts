package uao.edu.co.scouts_project.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbHealthCheck implements CommandLineRunner {
  private final JdbcTemplate jdbc;
  public DbHealthCheck(JdbcTemplate jdbc) { this.jdbc = jdbc; }

  @Override public void run(String... args) {
    Integer one = jdbc.queryForObject("SELECT 1", Integer.class);
    System.out.println("DB OK = " + one); // debe imprimir 1
  }
}