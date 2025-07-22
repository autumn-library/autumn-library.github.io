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

## Генерация единой страницы документации

Для создания/обновления единой страницы документации:

```sh
npm run generate-single-page
```

Это создаст файл `docs/single-page.md`, который объединяет все разделы "Начало работы" и "Использование фреймворка" в одну страницу.

## Деплой

См. https://github.com/autumn-library/autumn-library.github.io/blob/master/.github/workflows/deploy.yml
