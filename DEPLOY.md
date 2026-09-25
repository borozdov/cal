# Деплой

Прод: https://cal.borozdov.ru — VPS «My Server» (109.196.101.28), каталог `/opt/cal`.

- `docker-compose.prod.yml` поднимает `cal-app` (SPA + API, порт 4000) и `cal-db` (Postgres 16,
  данные в `/opt/cal/data/pg`). Наружу порты не открыты.
- HTTPS и домен — общий Caddy проекта short-link (`/opt/caddy-shared/Caddyfile`, блок
  `cal.borozdov.ru`), сеть `short-link_default`. Сертификат Let's Encrypt продлевается сам.
- DNS: A-запись `cal.borozdov.ru → 109.196.101.28` в Timeweb.
- Секрет: `/opt/cal/.env` с `POSTGRES_PASSWORD` (только на сервере).

Обновить после пуша в `main`:

```bash
ssh root@109.196.101.28 'cd /opt/cal && git pull && docker compose -f docker-compose.prod.yml up -d --build'
```

Миграции Prisma применяются при старте контейнера.

Бэкап базы:

```bash
ssh root@109.196.101.28 'docker exec cal-db pg_dump -U cal cal' > cal-$(date +%F).sql
```
