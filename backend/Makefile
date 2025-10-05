DEV_COMPOSE_FILE=docker-compose.yml

.PHONY: compose-up
compose-up:
	docker compose -f $(DEV_COMPOSE_FILE) up

.PHONY: compose-up-build
compose-up-build:
	docker compose -f $(DEV_COMPOSE_FILE) up --build

.PHONY: compose-down
compose-down:
	docker compose -f $(DEV_COMPOSE_FILE) down

.PHONY: compose-down-remove
compose-down-remove:
	docker compose -f $(DEV_COMPOSE_FILE) down -v