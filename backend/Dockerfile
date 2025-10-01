FROM eclipse-temurin:21-jdk-jammy AS dev
WORKDIR /app

# Copy Maven wrapper & config, cache dependencies
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN --mount=type=cache,target=/root/.m2 ./mvnw dependency:go-offline

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]