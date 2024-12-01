---
title: Пост-инициализация компонента
---

# Пост-инициализация компонента

Если вы все еще внимательно следите за нитью документации, у вас мог возникнуть вопрос вида ~~"Что за херня тут происходит"~~ "В каком порядке внедряются зависимости желудя?". И это очень хороший вопрос.

Установить значения в поля несозданного объекта или вызвать в нем какой-либо метод довольно проблематично. Поэтому:

- объект сначала создается (и вызывается его конструктор `ПриСозданииОбъекта`);
- затем пластилином обмазываются поля класса;
- оставшиеся куски пластилина идут на внедрение зависимостей через вызов методов.

В такой ситуации может возникнуть желание что-нибудь поделать с желудем, когда в него уже всё-всё внедрено. И такая возможность есть! Создаем новый метод (на этот раз без пластилина) и указываем над им аннотацию `&ФинальныйШтрих`.

::: code-group

```bsl [Классы/КлассСПостИнициализацией.os]
&Пластилин
Перем Логин;

&ФинальныйШтрих
Процедура Напоследочек() Экспорт
    Сообщить("Логин здесь уже доступен: " + Логин);
КонецПроцедуры

&Желудь
Процедура ПриСозданииОбъекта()
КонецПроцедуры
```

:::