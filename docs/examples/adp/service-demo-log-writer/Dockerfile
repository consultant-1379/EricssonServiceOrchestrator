FROM java:8-alpine as builder

WORKDIR /app

COPY . .

RUN ./gradlew shadowJar

FROM java:8-alpine

COPY --from=builder /app/build/libs/app.jar .

CMD ["java", "-jar", "app.jar"]
