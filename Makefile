.PHONY: help up down logs build test it clean format image ps

MVN := ./mvnw -B -ntp

help:
	@echo "Targets:"
	@echo "  up        - sobe toda a stack de apoio (docker compose)"
	@echo "  down      - derruba a stack (preserva volumes)"
	@echo "  logs      - tail dos logs da stack"
	@echo "  build     - mvn clean package (sem testes)"
	@echo "  test      - mvn test (unit)"
	@echo "  it        - mvn verify (unit + integration via testcontainers)"
	@echo "  run       - roda a app localmente (profile local)"
	@echo "  image     - build da imagem OCI via Spring Boot"
	@echo "  clean     - mvn clean + derruba volumes"

up:
	docker compose up -d
	@echo "Grafana: http://localhost:3000 | Swagger: http://localhost:8080/swagger-ui.html"

down:
	docker compose down

logs:
	docker compose logs -f --tail 200

build:
	$(MVN) clean package -DskipTests

test:
	$(MVN) test

it:
	$(MVN) verify

run:
	$(MVN) spring-boot:run -Dspring-boot.run.profiles=local

image:
	$(MVN) spring-boot:build-image -DskipTests

ps:
	docker compose ps

clean:
	$(MVN) clean
	docker compose down -v
