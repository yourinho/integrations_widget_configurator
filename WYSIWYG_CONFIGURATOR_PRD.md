# PRD: Albato Apps Widget — WYSIWYG Configurator

## Table of Contents

- [1. Overview](#1-overview)
- [2. Goals & Success Criteria](#2-goals--success-criteria)
- [3. Scope](#3-scope)
- [4. Architecture](#4-architecture)
- [5. Layout & UI Structure](#5-layout--ui-structure)
- [6. Functional Requirements](#6-functional-requirements)
  - [6.1 Превью виджета](#61-превью-виджета)
  - [6.2 Панель настроек](#62-панель-настроек)
  - [6.3 Кнопка «Получить код встраивания»](#63-кнопка-получить-код-встраивания)
- [7. Non-Functional Requirements](#7-non-functional-requirements)
- [8. Technical Decisions](#8-technical-decisions)
- [9. UI Copy](#9-ui-copy)
- [10. Future Considerations (Out of Scope v1)](#10-future-considerations-out-of-scope-v1)
- [11. References](#11-references)

---

## 1. Overview

**WYSIWYG Configurator** — веб-приложение для конечных клиентов Albato Embedded, позволяющее в визуальном режиме настроить виджет интеграций и сразу получить код для встраивания на свой лендинг.

### Цель
Дать клиентам возможность «примерить» настройки виджета на демо-странице и получить финальный фрагмент кода для вставки на свой сайт без необходимости изучать документацию.

### Основной сценарий
Пользователь открывает конфигуратор → настраивает параметры в боковой панели → видит изменения в реальном времени в превью → нажимает «Получить код» → копирует фрагмент и вставляет в свой лендинг.

---

## 2. Goals & Success Criteria

### Goals
- Снизить барьер входа для клиентов при встраивании виджета
- Исключить ошибки при ручном копировании и настройке параметров
- Дать возможность быстро оценить визуальный результат до интеграции

### Success Criteria
- Все параметры виджета доступны для настройки через UI
- Изменения в превью отображаются в реальном времени
- Сгенерированный код корректен и сразу готов к использованию
- Пользователь может скопировать код одним кликом

---

## 3. Scope

### In Scope
- Стек: Vanilla JS (без React, Vue, Svelte и т.п.)
- WYSIWYG-интерфейс с превью виджета и боковой панелью настроек
- Настраиваемый URL скрипта виджета (валидация формата + базовая безопасность)
- Настройка всех текущих параметров `initWidget` (см. [EMBEDDING_TUTORIAL](https://github.com/yourinho/integrations_widget/blob/main/EMBEDDING_TUTORIAL.md#option-details))
- Поиск партнёров по названию через API Albato; валидация `partnerIds` (только целые числа)
- Кнопка «Сбросить к дефолтам» для секции colors
- Обработка ошибок загрузки скрипта: отдельный UI + Retry
- Модальное окно с фрагментом кода (подсветка синтаксиса), копированием и ссылкой на документацию
- Загрузка виджета по URL из репозитория `integrations_widget`
- Переключение превью: desktop / mobile
- Адаптивность: stacked layout на экранах < 1024px

### Out of Scope (v1)
- Пресеты («Тёмная тема», «Компактный вид» и т.п.)
- Сохранение/загрузка конфигурации (localStorage, JSON)
- Шаринг настроек через URL
- Мобильная версия самого конфигуратора

---

## 4. Architecture

### Отношение к виджету
- Конфигуратор — **отдельный проект** (отдельный репозиторий/деплой)
- Виджет подключается по **настраиваемому URL** — пользователь может указать свой сервер (например, собственный хостинг вместо GitHub Pages)
- URL по умолчанию: `https://yourinho.github.io/integrations_widget/albato-widget.iife.js`
- Конфигуратор загружает скрипт динамически и вызывает `AlbatoWidget.initWidget()` с актуальными параметрами

### Документация
- Ссылка на инструкцию по встраиванию:
  ```
  https://github.com/yourinho/integrations_widget/blob/main/EMBEDDING_TUTORIAL.md#styling-tips
  ```

---

## 5. Layout & UI Structure

### Макет
```
┌─────────────────────────────────────────────────────────────────┐
│  Header: "Albato Widget Configurator"                            │
├──────────────────────────────────────┬──────────────────────────┤
│                                      │  Sidebar (desktop only)   │
│  Preview Area                         │  ─────────────────────   │
│  ─────────────────                   │  • widget script URL       │
│  [Desktop | Mobile] toggle            │  • regions                │
│                                      │  • font                   │
│  ┌────────────────────────────────┐  │  • colors (7 keys)       │
│  │                                │  │  • cardSize               │
│  │   Widget iframe / container    │  │  • detailCardSize         │
│  │   (demo page simulation)       │  │  • detailLayout           │
│  │                                │  │  • partnerIds             │
│  │                                │  │  • align                   │
│  └────────────────────────────────┘  │                          │
│                                      │  ─────────────────────   │
│                                      │  [Get Embed Code] btn     │
└──────────────────────────────────────┴──────────────────────────┘
```

### Боковая панель (справа)
- Фиксированная ширина (~320–360px) или доля экрана
- Скролл при необходимости
- Кнопка «Получить код встраивания» — внизу, sticky или фиксированная

### Область превью
- Занимает оставшееся пространство
- Сверху: переключатель Desktop / Mobile для отображения ширины контейнера
- При выборе Mobile: селект выбора размера экрана — все iPhone (начиная с iPhone X) и ТОП-5 Android по популярности
- Фон/обёртка имитируют демо-страницу (минималистичная рамка, чтобы виджет был читаем)

---

## 6. Functional Requirements

### 6.1 Превью виджета

**Описание:** Контейнер, в котором отображается виджет с актуальными настройками.

**Требования:**
- Виджет загружается по URL из поля «Widget script URL» (по умолчанию: `https://yourinho.github.io/integrations_widget/albato-widget.iife.js`)
- При изменении URL или любого другого параметра — виджет **переинициализируется** с новыми значениями (обновление в реальном времени)
- Переключатель **Desktop** / **Mobile** меняет ширину контейнера превью:
  - Desktop: ~1200px (или 100% доступной ширины)
  - Mobile: селект выбора устройства — ширина контейнера соответствует viewport выбранной модели. Список устройств:
    - **iPhone** (от iPhone X): X/XS/11 Pro/12 mini/13 mini (375px), XR/11/XS Max (414px), 12/13/14/15/16 (390px), 14/15/16 Pro (393px), 12/13 Pro Max/14 Plus (428px), 14/15/16 Pro Max/15 Plus (430px), 17/17 Pro (402px), 17 Plus (420px), 17 Pro Max (440px)
    - **Android (ТОП-5)**: Samsung Galaxy S24/S23 (360px), Samsung Galaxy A54 (412px), Google Pixel 8 (412px), Samsung Galaxy A55 (412px), OnePlus 12 (412px)
- Минимальная высота контейнера: 400px
- Обёртка превью: нейтральный фон/рамка (стиль демо-страниц из [examples](https://github.com/yourinho/integrations_widget/tree/main/examples))

**Обработка ошибок загрузки скрипта:**
- При 404, CORS, сетевой ошибке — отдельный UI-блок в области превью с сообщением об ошибке
- Кнопка **Retry** для повторной попытки загрузки

**Технические детали:**
- Контейнер — обычный `div`, переиспользуемый при переинициализации
- При смене URL: необходимо загрузить новый скрипт (удалить старый тег `<script>`, добавить новый с новым src). Скрипты с разными URL считаются разными.
- При смене других параметров: очистить контейнер (или unmount), при необходимости загрузить скрипт, вызвать `AlbatoWidget.initWidget({ container, ...params })`

---

### 6.2 Панель настроек

**Описание:** Элементы управления для URL виджета и всех параметров `initWidget`, кроме `container`.

| Параметр       | Тип       | UI-контрол | По умолчанию / примечания |
|----------------|-----------|------------|---------------------------|
| **Widget script URL** | `string` | Текстовое поле (URL) | `https://yourinho.github.io/integrations_widget/albato-widget.iife.js`. Валидация: формат URL + базовая проверка безопасности (только `https`, без `javascript:` и т.п.). Разумное ограничение длины. |
| `regions`      | `number[]`| Чекбоксы или multi-select | Если не указан или пустой массив — показывать все интеграции. Опции: 2 (BR), 3 (Global) |
| `font`         | `string`  | Текстовое поле | `""` (Inter по умолчанию). Подсказка: `'Open Sans', sans-serif`. Разумное ограничение длины. |
| `colors`       | `object`  | 7 полей color picker + hex input | См. таблицу цветов ниже. **Обязательно:** кнопка «Сбросить к дефолтам» для всей секции. |
| `cardSize`     | `string`  | Select: `l` \| `m` \| `s` | `l` |
| `detailCardSize`| `string`  | Select: `l` \| `m` \| `s` | `l` |
| `detailLayout`  | `string`  | Select: `stacked` \| `columns` | `stacked` |
| `partnerIds`   | `number[]`| **Поиск по названию** + список выбранных ID | `[]` (пусто). Только целые числа. Валидация обязательна. См. [поиск партнёров](#поиск-партнёров-partnerids) ниже. |
| `align`        | `string`  | Select: `center` \| `left` \| `right` | `center` |

**Colors (ключи и дефолты):**

| Ключ           | Дефолт    | Описание |
|----------------|-----------|----------|
| `primary`      | `#2C3534` | Активные табы, акценты |
| `background`   | `#FFFFFF` | Карточки, панели |
| `surface`      | `#F4F5F6` | Фоны, hover |
| `text`         | `#2C3534` | Основной текст |
| `textMuted`    | `#A0A4B1` | Вторичный текст |
| `border`       | `#E6E8EC` | Границы |
| `textOnPrimary`| `#FFFFFF` | Текст на primary-фоне |

- Поля для цветов: color picker + возможность ввода hex вручную
- **Обязательно:** кнопка «Сбросить к дефолтам» для всей секции colors

#### Поиск партнёров (partnerIds)
- UI: поле поиска по названию партнёра + список выбранных ID (чипы/теги с возможностью удаления)
- API: `GET https://api.albato.com/partners/info?filter[deprecated]=0&filter[title][like]=<query>` — из `response.data[].partnerId` берём ID
- Валидация: только целые числа; при некорректном вводе — подсветка ошибки
- Допустимы только ID, полученные через поиск или вручную (целые числа)

---

### 6.3 Кнопка «Получить код встраивания»

**Описание:** Кнопка внизу боковой панели, открывающая модальное окно с кодом.

**Поведение:**
1. По клику открывается модальное окно
2. В модалке отображается:
   - Фрагмент кода для вставки (HTML + script с вызовом `initWidget`) с **подсветкой синтаксиса**
   - Кнопка «Скопировать»
   - Ссылка: «Подробная инструкция по встраиванию» → `https://github.com/yourinho/integrations_widget/blob/main/EMBEDDING_TUTORIAL.md#styling-tips`

**Формат фрагмента кода:**
- Только фрагмент для вставки (не полная HTML-страница)
- Обязательно:
  - `<div id="albato-widget"></div>`
  - `<script src="<URL из поля Widget script URL>"></script>`
  - Вызов `AlbatoWidget.initWidget({ ... })` с актуальными параметрами
- В `src` используется значение из поля «Widget script URL» — чтобы клиент мог вставить код с выбранным сервером
- **Минимальный код:** параметры с дефолтными значениями опускать для читаемости

**Пример минимального вывода (если все дефолты):**
```html
<div id="albato-widget"></div>
<script src="https://yourinho.github.io/integrations_widget/albato-widget.iife.js"></script>
<script>
  AlbatoWidget.initWidget({
    container: document.getElementById('albato-widget')
  });
</script>
```

**Пример с кастомными параметрами:**
```html
<div id="albato-widget"></div>
<script src="https://yourinho.github.io/integrations_widget/albato-widget.iife.js"></script>
<script>
  AlbatoWidget.initWidget({
    container: document.getElementById('albato-widget'),
    regions: [2, 3],
    colors: { primary: '#1a56db', textMuted: '#6b7280' },
    cardSize: 'm',
    align: 'left'
  });
</script>
```

---

## 7. Non-Functional Requirements

### Адаптивность
- **Конфигуратор (layout):** desktop (viewport ≥ 1024px). На меньших экранах — **stacked layout**: превью сверху, панель настроек снизу (скролл по вертикали).
- **Превью виджета:** переключатель Desktop / Mobile в UI (см. выше).

### Производительность
- Обновление превью при вводе — на усмотрение реализации (debounce 100–200 ms для полей ввода или без задержки; оценить по поведению виджета)

### Зависимости
- Виджет загружается с внешнего URL (GitHub Pages или другой хост)
- Конфигуратор не требует бэкенда — статическое веб-приложение

---

## 8. Technical Decisions

| Тема | Решение |
|------|---------|
| Стек | Vanilla JS (HTML, CSS, JavaScript без фреймворков) |
| URL виджета | Настраиваемый параметр в UI. Валидация: формат + базовая безопасность. По умолчанию: `https://yourinho.github.io/integrations_widget/albato-widget.iife.js`. |
| Режим обновления превью | В реальном времени; debounce для полей ввода — на усмотрение по поведению виджета |
| Формат кода в модалке | Только фрагмент (div + script), не полная страница. Параметры с дефолтами — опускать (минимальный код). Подсветка синтаксиса — да. |
| Ошибка загрузки скрипта | Отдельный UI + кнопка Retry |
| Ссылка на документацию | https://github.com/yourinho/integrations_widget/blob/main/EMBEDDING_TUTORIAL.md#styling-tips |

---

## 9. UI Copy

| Элемент | Текст |
|---------|-------|
| Заголовок страницы | Albato Widget Configurator |
| Переключатель Desktop | Desktop |
| Переключатель Mobile | Mobile |
| Label селекта устройства (Mobile) | Screen size |
| Label поля URL виджета | Widget script URL |
| Кнопка получения кода | Get Embed Code |
| Заголовок модалки | Embed Code |
| Кнопка копирования | Copy |
| Ссылка на инструкцию | View embedding instructions |
| Сообщение после копирования | Copied to clipboard |
| Кнопка сброса цветов | Reset to defaults |
| Сообщение при ошибке загрузки скрипта | Failed to load widget script |
| Кнопка повторной загрузки | Retry |

---

## 10. Future Considerations (Out of Scope v1)

- Пресеты (Dark theme, Compact, etc.)
- Сохранение/загрузка конфигурации (localStorage, export/import JSON)
- Шаринг настроек через URL (query params)
- Мобильная версия конфигуратора
- Автоматическое обновление при добавлении новых параметров в виджет

---

## 11. References

- [Albato Apps Widget PRD](./Albato_apps_widget_prd.md)
- [Albato Partners API](https://api.albato.com/partners/info) — поиск партнёров по названию: `?filter[deprecated]=0&filter[title][like]=<query>`
- [EMBEDDING_TUTORIAL](./EMBEDDING_TUTORIAL.md)
- [Embedding Instructions (GitHub)](https://github.com/yourinho/integrations_widget/blob/main/EMBEDDING_TUTORIAL.md#styling-tips)
