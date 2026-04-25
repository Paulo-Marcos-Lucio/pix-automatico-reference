.PHONY: help up down logs build test it clean format image ps run run-fast web-dev web-build

MVN := ./mvnw -B -ntp

help:
	@echo "Targets:"
	@echo "  up        - sobe toda a stack de apoio (docker compose)"
	@echo "  down      - derruba a stack (preserva volumes)"
	@echo "  logs      - tail dos logs da stack"
	@echo "  build     - mvn clean package (sem testes, com frontend)"
	@echo "  test      - mvn test (unit)"
	@echo "  it        - mvn verify (unit + integration via testcontainers)"
	@echo "  run       - roda a app localmente com frontend bundled (profile local)"
	@echo "  run-fast  - roda só o backend, pulando o build do frontend"
	@echo "  web-dev   - roda o Vite dev server em http://localhost:5173 (proxy pra :8080)"
	@echo "  web-build - builda só o frontend (output em src/main/resources/static)"
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

run-fast:
	$(MVN) spring-boot:run -Dspring-boot.run.profiles=local -Dskip.web=true

web-dev:
	cd web && npm install && npm run dev

web-build:
	$(MVN) generate-resources

image:
	$(MVN) spring-boot:build-image -DskipTests

ps:
	docker compose ps

clean:
	$(MVN) clean
	docker compose down -v
