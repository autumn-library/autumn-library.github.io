# autumn-library.github.io

## Пререквизиты

* node.js 23+
* npm
* VSCode или IntelliJ IDEA для редактирования документации

## Сборка и запуск локально

```sh
npm install
npm run sync
npm run docs:dev
```

## Тесты

```sh
npm test
```

Тесты покрывают разбор `repositories.json` и построение меню навигации.

## Состав документации: repositories.json

Список продуктов задаётся в `repositories.json`. На верхнем уровне файла может находиться либо репозиторий, либо группа репозиториев:

```json
[
    {
        "organization": "autumn-library",
        "repository": "autumn"
    },
    {
        "group": "opentelemetry",
        "repositories": [
            {
                "organization": "nixel2007",
                "repository": "opentelemetry"
            },
            {
                "organization": "autumn-library",
                "repository": "autumn-opentelemetry"
            }
        ]
    }
]
```

Порядок записей в файле определяет порядок пунктов в меню "Документация" и "API", а репозитории группы собираются в отдельный подраздел выпадающего меню с заголовком, равным имени группы. Группа занимает в меню то же место, что и в файле.

На адреса страниц группировка не влияет: документация группы остаётся по адресам вида `/opentelemetry/` и `/api/opentelemetry/`.

## Генерация единой страницы документации

Система поддерживает создание единой страницы документации для любого продукта или API на основе всех markdown файлов в соответствующей директории.

### Автоматическая генерация

Во время сборки (`npm run docs:build`) автоматически генерируются единые страницы для всех продуктов и API, которые содержат markdown файлы. Сгенерированные файлы помещаются в `docs/single-page-[тип]-[продукт].md`.

### Ручная генерация

Для создания единой страницы для конкретного продукта:

```sh
# Для продуктов
npm run generate-single-page products 000-autumn
npm run generate-single-page products 002-annotations

# Для API
npm run generate-single-page api 000-autumn
npm run generate-single-page api 002-annotations
```

Для просмотра доступных продуктов и APIs:

```sh
npm run generate-single-page
```

### Навигация

Ссылки на единые страницы автоматически добавляются в меню навигации:
- В разделе "Документация" для продуктов
- В разделе "API" для API документации

Единые страницы не коммитятся в репозиторий и генерируются по требованию.

## Деплой

См. https://github.com/autumn-library/autumn-library.github.io/blob/master/.github/workflows/deploy.yml
