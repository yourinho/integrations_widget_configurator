# Инструкция: размещение на GitHub Pages

Этот проект — статический сайт. Его можно развернуть на GitHub Pages без сборки.

---

## Вариант 1: Новый репозиторий

### Шаг 1. Создайте репозиторий на GitHub

1. Откройте [github.com](https://github.com) и войдите в аккаунт.
2. Нажмите **+** → **New repository**.
3. Укажите:
   - **Repository name:** например, `albato-widget-configurator` или `widget-configurator`
   - **Visibility:** Public
   - **Initialize this repository with:** можно оставить пустым (README, .gitignore и т.п. не создавать)
4. Нажмите **Create repository**.

### Шаг 2. Инициализируйте Git и отправьте код

В терминале в папке проекта выполните:

```bash
# Инициализация (если ещё не инициализирован)
git init

# Добавить все файлы
git add .

# Первый коммит
git commit -m "Initial commit: Albato Widget Configurator"

# Добавить remote (подставьте YOUR_USERNAME и YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Отправить в ветку main (или master)
git branch -M main
git push -u origin main
```

Если репозиторий уже создан с README, выполните:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Вариант 2: Уже есть репозиторий

Если проект уже в Git и вы просто обновили код:

```bash
git add .
git commit -m "Prepare for GitHub Pages deployment"
git push origin main
```

---

## Включение GitHub Pages

### Шаг 1. Откройте настройки репозитория

1. Зайдите в репозиторий на GitHub.
2. Вкладка **Settings**.
3. Слева раздел **Pages** (в блоке «Code and automation»).

### Шаг 2. Настройте источник

1. **Source:** Deploy from a branch  
2. **Branch:** `main` (или `master`)  
3. **Folder:** `/ (root)`  
4. Нажмите **Save**.

### Шаг 3. Ожидание деплоя

Через 1–3 минуты сайт появится по адресу:

```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

Пример: если репозиторий `yourinho/albato-widget-configurator`, то:

```
https://yourinho.github.io/albato-widget-configurator/
```

Статус деплоя можно посмотреть во вкладке **Actions**.

---

## Что будет на сайте

GitHub Pages отдаёт статические файлы. В корне репозитория должны лежать:

- `index.html` — главная страница
- `styles.css`
- `app.js`
- папка `lib/` с JS-файлами

Сборка не нужна, всё уже готово для раздачи.

---

## Важные моменты

### CORS и API

- Партнёрский API (поиск по имени) и виджет с другого домена будут доступны, т.к. они на HTTPS и поддерживают CORS.

### Виджет по умолчанию

- По умолчанию используется `https://yourinho.github.io/integrations_widget/albato-widget.iife.js`.
- Пользователи могут указать свой URL виджета.

### Ошибка «Failed to load widget script»

- Может появляться, если URL виджета неверный или сервер недоступен.
- Для дефолтного виджета обычно всё работает, если `integrations_widget` развёрнут на GitHub Pages.

---

## Кастомный домен (опционально)

1. В **Settings → Pages** введите свой домен (например, `configurator.example.com`) в поле **Custom domain**.
2. В DNS провайдере настройте запись CNAME:
   - Имя: `configurator` (или поддомен)
   - Значение: `YOUR_USERNAME.github.io`
3. Включите **Enforce HTTPS** после того, как DNS обновится.

---

## Обновление сайта

После `git push` GitHub Pages автоматически пересоберёт и обновит сайт:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Через 1–3 минуты изменения появятся на сайте.

---

## Проверка перед деплоем

Убедитесь, что всё работает локально:

```bash
npx serve .
```

Откройте http://localhost:3000 и проверьте:

- Переключение Desktop / Mobile
- Фильтр по регионам
- Выбор шрифта
- Цвета
- Генерация embed-кода

Если всё корректно, можно деплоить на GitHub Pages.
