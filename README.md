# tg_mini_apps
instruction_1
# Telegram Mini App — Просмотр инструкции

Готовое web-приложение для Telegram Mini Apps, которое показывает инструкцию из **опубликованного** Google Docs.

## Подключение Google Docs
1. Google Docs → **Файл → Публикация в Интернете** → Опубликовать.
2. Получите ссылку вида `https://docs.google.com/document/d/.../pub`.
3. Передайте её в WebApp:
   - через параметр `?doc=` в URL, или
   - пропишите в `window.APP_CONFIG.DOC_PUBLISHED_URL` в `script.js`.

## Деплой на GitHub Pages
1. Загрузите эти файлы в репозиторий.
2. Settings → Pages → Deploy from a branch → `main` / `/root` → Save.
3. Откройте `https://<user>.github.io/<repo>/index.html?doc=<URL_из_GDocs>`.

## Подключение к боту
Через BotFather добавьте **Web App**-кнопку с URL на `index.html`.
