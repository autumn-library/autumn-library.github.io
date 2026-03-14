---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Autumn/ОСень"
  text: "Фреймворк компонентных приложений для OneScript"
  tagline: "Добро пожаловать в уютный мир сообщества Autumn/ОСень - фреймворка для создания приложений на OneScript с применением подходов Dependency Injection и Inversion of Control."
  image:
    src: acorn-ol-shadow.webp
    alt: Autumn
  actions:
    - theme: brand
      text: Перейти в документацию
      link: /getting-started/about-autumn
features:

  - title: Компонентный подход
    details: Фреймворк поможет вам собирать ваше приложение из компонентов, без необходимости заниматься их собственным созданием или настройкой
    icon: 🛠️
  - title: Автоматическая обработка зависимостей
    details: Autumn - это Dependency Injection Framework. Его задача - исключение необходимости разработчику следить за составом, количеством и порядком параметров конструирования при создании новых объектов с зависимостями
    icon: 🤖
  - title: Упрощение поддержки
    details: Компонентный подход позволяет упростить дальнейшую поддержку проекта благодаря сохранению ПЕО (Принципа Единой Ответственности)
    icon: 🙂
  - title: Because its fucking awesome
    details: ""
    icon: 🤩

  - title: "Основные модули"
    details: "В ядро ОСени с самого начала была заложена расширяемость. Само ядро состоит из нескольких связанных между собой модулей:"
  - title: Autumn/ОСень
    details: Ядро фреймворка и основной раздел документации. Если вы только начинаете знакомство с ОСенью, то начните с этого раздела.
    icon: 🍂
    link: /getting-started/about-autumn
    linkText: Документация
  - title: Annotations
    details: Библиотека для работы с аннотациями, может использоваться отдельно от экосистемы ОСени
    icon: 🍁
    link: /annotations
    linkText: Документация
  - title: Autumn-collections
    details: Модуль реализует функциональность прилепляемых коллекций для ОСени.
    icon: 🐿️
    link: /autumn-collections
    linkText: Документация

  - title: "Дополнительные модули общего назначения"
    details: "Эта расширяемость также находит отражение в дополнительных модулях, которые расширяют возможности фреймфорка:"
  - title: Autumn-logos
    details: модуль легкой работы с логами поверх библиотеки logos
    icon: 🪵
    link: https://autumn-library.github.io/autumn-logos
    linkText: Документация
  - title: Autumn-cli
    details: Модуль для создания консольных приложений поверх библиотеки cli
    icon: 🍄
    link: https://autumn-library.github.io/autumn-cli
    linkText: Документация
  - title: Autumn-async
    details: Модуль асинхронного исполнения методов.
    icon: 🔀
    link: https://autumn-library.github.io/autumn-async
    linkText: Документация
  - title: Autumn-synchronized
    details: Модуль для синхронизации исполнения методов.
    icon: 🚦
    link: https://autumn-library.github.io/autumn-synchronized
    linkText: Документация
  - title: Autumn-event-publisher
    details: Механизм подписок на события и публикации событий.
    icon: 📰
    link: https://autumn-library.github.io/autumn-event-publisher
    linkText: Документация
  - title: Autumn-killjoy-flavour
    details: Набор аннотаций для ОСени, который поубивает весь кайф.
    icon: ☠️
    link: https://autumn-library.github.io/autumn-killjoy-flavour
    linkText: Документация
  - title: ""
    details: "To be continued..."
    icon: ⏳️
    link: ""

  - title: "Стоящие внимания"
    details: "Мы надеемся, что на просторах GitHub начнут появляться и другие библиотеки и приложения на базе ОСени:"
  - title: Winow
    details: Веб-сервер на чистом OneScript.
    icon: 🍷
    link: /winow
    linkText: Документация
  - title: ovm
    details: Менеджер версий OneScript на базе autumn-cli.
    icon: 🦫
    link: https://github.com/oscript-library/ovm
    linkText: Документация
  - title: Autumn-atm
    details: Демо-приложение со стрима на канале Веселый1С
    icon: 💳
    link: https://github.com/autumn-library/autumn-atm
    linkText: Документация
  - title: Autumn-dduck
    details: Модуль для работы с DDNS Duck-DNS.
    icon: 🦆
    link: https://autumn-library.github.io/autumn-dduck
    linkText: Документация
  - title: Сodestatprofiler
    details: Приложение для визуализации результатов замеров производительности OneScript.
    icon: 📊
    link: https://github.com/autumn-library/codestatprofiler
    linkText: Документация
  - title: oproxy
    details: "TCP-прокси сервер для хранилища конфигураций 1С: Предприятие 8"
    icon: 🛡️
    link: https://github.com/infina15/oproxy
    linkText: Документация
  - title: curlone
    details: "Конвертер команды curl в код на языке 1С"
    icon: 🦅
    link: https://github.com/alei1180/curlone
    linkText: Документация
  - title: Share-bsl
    details: "Телеграм-бот для публикации исходников на сервис GitHub Gist"
    icon: 💬
    link: https://github.com/Untru/share_bsl
    linkText: Документация
  - title: prometheus-metrics
    details: "Веб-сервис с эндпоинтом GET /metrics для отдачи метрик в формате Prometheus."
    icon: 📈
    link: https://github.com/yellow-hammer/prometheus-metrics
    linkText: Документация
  # - title: ""
  #   details: "To be continued..."
  #   icon: ⏳️
  #   link: ""
---
