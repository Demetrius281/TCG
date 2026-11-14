# TASK 6 — правила проверяются в момент записи кода

Ветка `next`. `main` и /legacy не тронуты. Отчёт на русском.

Итог одной строкой: **lock, lock:selftest, check, build, check:layout проходят с 0 ошибок и пустыми baseline. `npm run audit` пока НЕ проходит (11348 нарушений, покрытие полное, 0 пробелов).** Нарушения не «подгонялись» вручную вне примитивов (см. раздел 7).

## 1. Примитивы (src/components/ui) — единственное место, где существуют размер, отступ и шрифт

Раскладка
- **Section** — экран: tone, layout `stacked | split | article | hero` (hero = первый экран, с `art` 50/50 gap 64), padding 56/112, gap 40 между шапкой и контентом.
- **SectionHead** — заголовок экрана; title → text 16; слот по умолчанию (список) 32 ниже текста; слот `actions` (кнопки) 32 ниже текста.
- **Stack** — вертикальный ряд; `gap` только из шкалы 8/12/16/24/32/40 (тип `Gap` генерируется из rules.json, другое значение не собирается).
- **Cluster** — горизонтальный ряд с переносом; `gap` из шкалы или `buttons` (12/16).
- **Grid** — единственная сетка карточек: 1/2/(2,3,4) колонки, gap 16/32.

Содержимое
- **Card** — единственная карточка: padding 24, title → text 12, слоты `foot` и `actions` (кнопки через 32), варианты `surface | note`, без сдвига при hover.
- **Text** — единственный текстовый элемент; `role` = page-title | section-title | card-title | text | small | label | metric | control; `tone`.
- **List** — единственный список (ромб 8px / «01»).
- **Table** — единственная таблица, полная ширина, отступы ячеек из шкалы.
- **Rows** — строки-ссылки с hairline (сервисы, темы, источники).
- **Stats** — крупные цифры (metric) с подписями.
- **LogoGrid** — сетка логотипов с оптической высотой.
- **Media** — рамка с фиксированной высотой (фото, карта).
- **Accordion** — FAQ.

Действия
- **Button**, **Action**, **WhatsAppLink** — кнопки (52px, радиус 0).
- **ActionStack** — кнопка + центрированная ссылка под ней (класс теперь `.action-stack`, чтобы не конфликтовать с `Stack`).

Формы
- **Field** (label + control + help + error), **Choices** (radio/checkbox-строки), **Check** (одиночный чекбокс), **FormButton** (primary/back/pin), **Stage** (список этапов), **StepBar** (прогресс), **DataRows** (строки «название — значение»).

Оболочка сайта
- **Header**, **Footer**, **MobileMenu**, **SkipLink** (перенесены из `layout/` в `ui/`), **SectionNav** (компактная навигация гида), **DesktopIllustration**.

Список зафиксирован в `qa/rules/blocks.json`; добавление блока или примитива = правка этого защищённого файла.

## 2. qa/rules/blocks.json

```json
{
  "primitives": [
    "Accordion", "Action", "ActionStack", "Button", "Card", "Check", "Choices", "Cluster", "DataRows", "DesktopIllustration",
    "Field", "Footer", "FormButton", "Grid", "Header", "List", "LogoGrid", "Media", "MobileMenu", "Rows",
    "Section", "SectionHead", "SectionNav", "SkipLink", "Stack", "Stage", "Stats", "StepBar", "Table", "Text", "WhatsAppLink"
  ],
  "blocks": [
    "AcquisitionCase", "Answers", "Architecture", "Blocks", "Cards", "Comparison", "Cta", "Disclosure", "Faq", "Features",
    "Flow", "Guide", "GuideNav", "Hero", "Inquiry", "Logos", "Metrics", "Order", "Pricing", "Report", "Sample",
    "Services", "Sources", "Spotlight", "Steps", "Styleguide", "Testimonials", "Topics"
  ]
}
```

## 3. Lock на всём репозитории

```
$ npm run lock
lock passed: 0 errors (34 ms)
```

Один линтер `scripts/lock.mjs` (postcss + собственные проверки L3/L4), весь репозиторий — около 35 мс. Те же сообщения (файл, строка, значение, правило, допустимая альтернатива) используют три шлюза.

Остальные проверки на итоговом коде: `npm run lock:selftest` — passed; `npm run check` — 0 known violations; `npm run build` — OK (6 страниц, включая 404); `npm run check:layout` — passed, baseline пуст.

## 4. lock:selftest (qa/lock-fixtures, постоянно в CI)

| fixture | выглядит как | ожидается | результат |
|---|---|---|---|
| 01-margin-in-block | blocks/Cta.astro | L1 | поймано (L1) |
| 02-gap-zero-in-block | blocks/Cta.astro | L1 | поймано (L1) |
| 03-font-size-in-block | blocks/Cta.astro | L1 | поймано (L1) |
| 04-text-transform-on-label | blocks/Cta.astro | L1, L3 | поймано (L3, L1) |
| 05-raw-px-in-primitive | ui/Stack.astro | L2 | поймано (L2) |
| 06-inline-style | blocks/Cta.astro | L3 | поймано (L3) |
| 07-strong-tag | blocks/Cta.astro | D2 | поймано (D2) |
| 08-important | blocks/Cta.astro | L3 | поймано (L3) |
| 09-global-selector | blocks/Cta.astro | L3 | поймано (L3) |
| 10-unlisted-block-in-page | pages/example.astro | L4 | поймано (L4) |
| 11-padding-in-block | blocks/Cards.astro | L1 | поймано (L1) |
| 12-width-in-block | blocks/Cards.astro | L1 | поймано (L1) |
| 13-transform-in-block | blocks/Cards.astro | L1 | поймано (L1) |
| 14-weight-600 | ui/Text.astro | D2 | поймано (D2) |
| 15-style-is-global | blocks/Cta.astro | L3 | поймано (L3) |
| 16-script-writes-style | blocks/Cta.astro | L3 | поймано (L3) |
| 17-gap-not-in-scale | blocks/Cta.astro | D5 | поймано (D5) |
| 18-redefine-primitive-class | blocks/Cta.astro | L3 | поймано (L3) |
| 19-block-not-in-registry | blocks/NewBlock.astro | L4 | поймано (L4) |
| 20-block-imports-unlisted-primitive | blocks/Cta.astro | L4 | поймано (L4) |
| 21-raw-rem-in-base.css | styles/base.css | L2 | поймано (L2) |
| 22-unknown-token | ui/Card.astro | L2 | поймано (L2) |
| 23-colour-literal-in-block | blocks/Cta.astro | L1 | поймано (L1) |
| 24-invalid-text-role | blocks/Cta.astro | L1 | поймано (L1) |
| 99-clean-block | blocks/Cta.astro | нет ошибок | проходит (чисто) |

Первый прогон поймал два дефекта самого lock (шаблоны с комментарием в первой строке не разбирались, поэтому L4 пропускался); исправлено, повторный прогон — 25/25.

## 5. Три шлюза

- **G1, момент записи.** `.claude/hooks/lock-write.mjs` (PreToolUse на Edit, Write, MultiEdit, NotebookEdit) вычисляет итоговое содержимое файла и запускает lock до записи; ошибка → exit 2, файл не записывается. `.claude/hooks/bash-guard.mjs` (PreToolUse на Bash) блокирует запись в src/, scripts/, qa/, .claude/, .github/, .githooks/, CLAUDE.md, tokens.css, package.json через редирект, tee, sed -i, perl -i, cp, mv, install, ln, git apply/am, git checkout/restore другого коммита, встроенные python/node-скрипты с записью; а также `--no-verify`, `core.hooksPath`, `HUSKY=0` и правку `.githooks/`.
- **G2, коммит.** `.githooks/pre-commit` разворачивает staged-дерево (`git checkout-index`) во временную папку и запускает там lock и `npm run check`. `npm install` ставит хук через `prepare`. Коммит с нарушением не создаётся.
- **G3, merge.** Workflow `design-check.yml` на каждый push и PR: lock → lock:selftest → check → build → check:layout → audit. Для PR в `main` скрипты проверок берутся из `main` (check-design, lock, lock-selftest, gen-scale, audit, package.json, package-lock.json, .githooks, qa/rules, qa/baseline, qa/lock-fixtures), а изменения защищённых файлов требуют метки `rules-approved`.

В защищённые файлы (guard.mjs и CLAUDE.md) добавлены: `scripts/lock.mjs`, `lock-selftest.mjs`, `gen-scale.mjs`, `audit.mjs`, `.githooks/`, `package.json`, `qa/rules/` (включая `blocks.json`), `qa/lock-fixtures/`, `tokens.css`.

### Демонстрация G1 (реальный отказ хука)

Попытка добавить в `Cta.astro` блок `.cta { display: grid; gap: 0; margin-top: 20px; }`:

```
PreToolUse:Edit hook error: [node "$CLAUDE_PROJECT_DIR/.claude/hooks/lock-write.mjs"]: LOCK: this edit to src/components/blocks/Cta.astro breaks the design rules and was NOT written.

src/components/blocks/Cta.astro:30  [L1] gap: 0 in a block
    allowed: spacing, size and type exist only in primitives: use Stack/Cluster/Grid/Card/Text (gap="8|12|16|24|32|40")
src/components/blocks/Cta.astro:30  [L1] margin-top: 20px in a block
    allowed: spacing, size and type exist only in primitives: use Stack/Cluster/Grid/Card/Text (gap="8|12|16|24|32|40")

Fix the content so it uses the primitives (src/components/ui) and tokens, then try again. See CLAUDE.md and qa/rules/rules.json.
```

Попытка записать в файл из shell (`echo "/* x */" >> src/styles/base.css`):

```
PreToolUse:Bash hook error: [node "$CLAUDE_PROJECT_DIR/.claude/hooks/bash-guard.mjs"]: LOCK: this shell command is blocked because it writes src/styles/base.css.

Source files, scripts, qa/, .claude/, .github/, CLAUDE.md and tokens.css are changed with the Edit/Write tools only:
the lock (scripts/lock.mjs) checks the new content before it is written. Use Edit or Write for this change.
```

Хук блокировал и мои собственные команды во время работы (правка `.githooks/` и `.github/` через python, чтение `core.hooksPath`), после чего я перешёл на Edit/Write.

## 6. Что изменилось в правилах (D1–D7 записаны в CLAUDE.md и rules.json)

- D1 роль `control` (14/15, sans, 500, без uppercase) для `.btn`, `.ei-btn`, `<a>`; D2 без `<b>/<strong>` и без веса 600/700 (в `inline()` разметка `**x**` теперь даёт обычный текст); D3 любой связный текст ≤720; D4 text → buttons 32 везде (в Card кнопки лежат в слоте `actions`, ровно 32 под текстом, а не прижаты к низу); D5 шкала 8/12/16/24/32/40 (токены `--s-8`…`--s-40`, удалены `--space-1/5/12/16/20/24`); D6 card-title → text 12; D7 исключения svg/[data-illustration] и aria-hidden-глифы для R1.
- Новая страница `src/pages/404.astro` (первый экран из блока Hero, текст из legacy/404.html, без eyebrow). Закрыт пробел покрытия `/404`.
- `/styleguide` теперь блок `Styleguide`: показывает все примитивы и все блоки.
- `qa/rules/layout.mjs`, `audit-dom.mjs`, `audit.mjs` обновлены под структуру примитивов: класс `.action-stack`, вес шрифта через токен `--fw-*`, зонд R6 с `max-width:none`, R2 на `/404` (один экран) помечен «не применимо», proof встраивается в report.md.

## 7. Вопросы: где примитивов не хватило или я принял решение за вас

1. **Новые примитивы.** Из поставленного списка добавлены Stack, Cluster, Card, Text, Table, Accordion, Rows, Stats, LogoGrid, Media, Field, Choices, Check, FormButton, Stage, StepBar, DataRows, SectionNav. Без них блоки нельзя собрать без собственного CSS. Подтвердите или скажите, что убрать.
2. **Header, Footer, MobileMenu, SkipLink перенесены из `layout/` в `ui/`.** L1 разрешает CSS только в tokens, base и `ui/*.astro`, а оболочке нужны sticky/fixed/transform. Это единственный способ получить 0 ошибок без блока, нарушающего L1.
3. **GuideNav** остался блоком, но сам рисуется примитивом SectionNav (фиксированная панель с выпадающим переходом и кнопкой «наверх»). Выразить это блоком без position/transform нельзя.
4. **Упрощения внешнего вида ради композиции из примитивов** (содержимое сохранено): Testimonials — карусель, пауза и круглые фото заменены сеткой карточек; Pricing — без subgrid, без выделенной средней карточки и без мобильного горизонтального скролла, кнопки не прижаты к низу карточки (D4); Architecture — три колонки карточек без соединителей и анимации; Flow — сетка из трёх колонок (линии рисует прежний скрипт); Report/Sample — карточка и таблица вместо макета документа и цветных точек; AcquisitionCase — карточка без макетных иконок в фактах; Services/Topics/Sources — строки в пределах контейнера, без выхода hairline за края экрана; Cta — шапка и кнопка в одной колонке, блок документов карточкой ниже; split-экраны (Report, Spotlight, AcquisitionCase, Answers, Features, Faq split) теперь 5/12 + 7/12 по разрешённой вариации B; Guide — 17 типов частей собраны из Card/Grid/Rows/Table/List/Stack, «chain» показывается подписью «01 · 02» вместо индикатора; hover карточек без подъёма (убирает R2).
5. **Guide: заголовок → текст 24 вместо 12 (R4).** Подзаголовки гида и следующая часть лежат в одном Stack с шагом 24. Чтобы получить 12, нужен вспомогательный блок `GuidePart` (новый блок в blocks.json) — без вашего разрешения не добавлял.
6. **Карточки `cards` с полем `label` над h3** (28 нарушений R3, «label never above a heading»): это решение по контенту (убрать поле или поменять порядок), код тут ни при чём.
7. **R1 (края).** 11 195 из 11 348 нарушений. Это тексты в колонках таблиц, второй элемент в строках `Cluster` с `justify="between"` и колонки `Rows`. Аудит считает «краем колонки» только grid/flex-родителей, а не колонки `<table>`. Нужно решение владельца: колонки таблицы и правый элемент строки считаются краем колонки или нет (правка qa/rules/audit-dom.mjs, не мой выбор).
8. **Хак `[hidden][hidden][hidden]`** в base.css: примитивы задают `display`, а `!important` запрещён (L3), поэтому атрибут `hidden` усилен специфичностью.
9. **Что lock не проверяет.** Внутри `ui/*.astro` разрешены любые CSS-свойства, ограничены только значения (токены, без raw px/rem/em/vw, спейсинг-токены из списка). Проверки шаблонов (inline-style, `<b>`, `gap=`, `role=`) основаны на регулярных выражениях, а не на полном разборе AST.
10. **Защищённый список** в проверке PR исключает `qa/audit`, `qa/lock`, `qa/output` (генерируемые отчёты), иначе каждый коммит отчёта требовал бы метку.
11. `src/scripts/regulations-mobile.js` и `regulations-faq-title.js` нигде не подключены; не трогал.
12. В `package.json` добавлен `postcss` в devDependencies (его использует lock; раньше он был только транзитивным), `package-lock.json` обновлён.

## 8. Аудит (npm run audit, Chromium + WebKit)

```
COVERAGE: 6 pages x 125 screens (header, sections, footer) x 4 full widths (375/768/1280/1440) + 33 sweep widths (320-1600 step 40) x 14 state kinds x 2 browsers (chromium, webkit); elements checked per rule: R1=296412 R2=4544 R3=179572 R4=348222 R5=34536 R6=45046 R7=8736 R8=13890 R9=92520 X=299410; recount: screens 9104=9104 MATCH, visible text nodes 179780+6168 excluded=185948 vs 185948 MATCH; violations (unique): 11348; coverage gaps: 0
```

Было до миграции (TASK 4): 11185 нарушений, 1 пробел покрытия (/404). Стало: 11348 нарушений, 0 пробелов, 6 страниц. R1 вырос с 8622 до 11195: проверка считает краем колонки только grid/flex, а таблицы и строки примитивов дают много текста в «колонках» (см. вопрос 7). Остальные правила упали: R3 2025 → 28, R4 249 → 108, R6 237 → 0, R9 25 → 0, X 19 → 13, R2 6 → 1; R8 вырос 2 → 3 (вторая primary-кнопка на главной). R5 и R7 нарушений не дают.

Proof (все 172 зонда пойманы, 8 «не применимо»): `qa/audit/report.md`, раздел d.

Нарушения по страницам и правилам:

| страница | R1 | R2 | R3 | R4 | R8 | X |
|---|---|---|---|---|---|---|
| / | 4 | | | 2 | 1 | 2 |
| /404 | 4 | | | | | 2 |
| /due-diligence | 1031 | | 10 | 16 | | 2 |
| /platform | 340 | | | 2 | | 2 |
| /regulations | 4107 | | 7 | 33 | | 3 |
| /styleguide | 5709 | 1 | 11 | 55 | 2 | 2 |

Страница → экран → элемент (главные экраны; полный список с шириной, состоянием, браузером, измерением и требованием — `qa/audit/report.md`, раздел c):

- `/` — header: «Buyers», «Owners» (X, текст шире рамки на 2 px в мобильном меню); «Proof you can check»: «Indonesia · UAE · Singapore…» (R4, 12 вместо 16); «Start where you are»: «Not sure where to start?» (R4); «The legal picture of any Bali property…»: «Checking a property now?» (R8, вторая primary-кнопка); a.skip «Skip to content» (R1, ссылка-пропуск за экраном).
- `/404` — header (X), a.skip (R1).
- `/due-diligence` — «Everything We Find. Clearly Explained.» 829 (колонки таблицы Source/Status и т. д.); «From Order to Report in Four Steps» 140 («About 2 minutes», «Optional»); «Choose the Depth of Your Check» 31 («Most Complete»); «Check a Property» 29 (R3 «Step 1 of 4», R4 12 шт.); «Why Pay for Full Due Diligence» 18; «Know the Risks Before You Pay» 6 (R3: label «01/02/03» над h3).
- `/platform` — «Invest in Bali's Property Intelligence» 118 («Required», «Optional»); «An Unmatched Advantage in Every Negotiation» 112; «Online Property Due Diligence» 85 («1 week+», «→»); «Infrastructure Behind Property Intelligence» 23.
- `/regulations` — «What a property compliance audit checks» 1094; «How an existing property is legalized» 1022; «What a PT PMA can register in Bali in 2026» 843; «Each layer, its documents and what they confirm» 619; «NIB, OSS and the current villa KBLI» 305; «What changed in 2026» 176; «PBG, SLF and legacy IMB» 70; R3 «Bali Property Legality: The Short Answer» 6.
- `/styleguide` — те же экраны, что на страницах выше, плюс «Card, Table, Rows, Stats» 204 и «Form primitives» 38; R2: «Preliminary Due Diligence…» (лишний h1 в образце первого экрана).

## 9. Что осталось

`npm run audit` по-прежнему красный, поэтому Action `design-check` на этом коммите будет красным (lock, lock:selftest, check, build, check:layout в нём зелёные). Дальше решения владельца: пункты 1–7 из раздела 7. Ничего сверх миграции не чинил.
