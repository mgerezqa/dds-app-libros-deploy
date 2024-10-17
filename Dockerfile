# syntax = docker/dockerfile:1.2
#
# Build stage
#
FROM maven:3.8.6-openjdk-18 AS build
WORKDIR /app
COPY . .
RUN mvn clean package assembly:single -DskipTests

#
# Package stage
#
FROM openjdk:17-jdk-slim
COPY --from=build /app/target/javalin-deploy-1.0-SNAPSHOT-jar-with-dependencies.jar libros.jar
COPY .env .env
# ENV PORT=8070
EXPOSE 8070

# Instalar psql
RUN apt-get update && apt-get install -y postgresql-client

CMD ["java","-classpath","libros.jar","ar.edu.dds.libros.AppLibros"]
