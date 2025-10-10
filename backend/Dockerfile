FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache de dependencias
COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw ./
RUN chmod +x mvnw && ./mvnw -q -B -DskipTests dependency:go-offline

# Código fuente
COPY src ./src

# Empaque (JAR con capas de Spring Boot)
RUN ./mvnw -q -B -DskipTests package

# ===== STAGE 2: Runtime =====
FROM eclipse-temurin:21-jre-alpine

# Usuario no root
RUN addgroup -S app && adduser -S app -G app
USER app

WORKDIR /app

# Copiar artefacto
COPY --from=builder /app/target/*.jar /app/app.jar

# Variables opcionales (ajústelas en Fly: [env] / fly secrets)
ENV JAVA_OPTS="" \
    SPRING_PROFILES_ACTIVE=${APP_PROFILE:-development}

EXPOSE 8080

# Inicio
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]