FROM maven:4.0.0-rc-5-eclipse-temurin-17-noble AS build

WORKDIR /app
#coppy vao thu muc app( . la thu muc hien tai)
COPY pom.xml .
COPY src ./src

RUN mvn package -DskipTests

#STAGE 2:
FROM amazoncorretto:17.0.18-al2023-headful
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

#run "java -jar app.jar"
ENTRYPOINT ["java","-jar","app.jar"]
#cmd docker build -t name:version