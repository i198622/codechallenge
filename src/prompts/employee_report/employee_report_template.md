# Общий отчет по Merge Requests

## Общая информация
- **Период отчета:** `<start_date> - <end_date>`
- **Количество Merge Requests:** `<number_of_mrs>`
- **Средняя сложность:** `metricsSummary.complexity.classification`

## Сводные Метрики

### Code Style
- **Средняя оценка:** `metricsSummary.codeStyle.score`
- **Сводное резюме:**
  `metricsSummary.codeStyle.summary`
- **Детальный анализ:**
  `metricsSummary.codeStyle.detailed_analysis`
- **Рекомендации:**
  - `metricsSummary.codeStyle.recommendations[0]`
  - `metricsSummary.codeStyle.recommendations[1]`
  - ... *(перебрать все элементы массива metricsSummary.codeStyle.recommendations)*
- **Уверенность:** `metricsSummary.codeStyle.confidence`

### Design Patterns
- **Средняя оценка:** `metricsSummary.designPatterns.score`
- **Сводное резюме:**
  `metricsSummary.designPatterns.summary`
- **Детальный анализ:**
  `metricsSummary.designPatterns.detailed_analysis`
- **Рекомендации:**
  - `metricsSummary.designPatterns.recommendations[0]`
  - `metricsSummary.designPatterns.recommendations[1]`
  - ... *(перебрать все элементы массива metricsSummary.designPatterns.recommendations)*
- **Уверенность:** `metricsSummary.designPatterns.confidence`

### Anti-Patterns
- **Средняя оценка:** `metricsSummary.antiPatterns.score`
- **Сводное резюме:**
  `metricsSummary.antiPatterns.summary`
- **Детальный анализ:**
  `metricsSummary.antiPatterns.detailed_analysis`
- **Рекомендации:**
  - `metricsSummary.antiPatterns.recommendations[0]` *(если существует)*
  - `metricsSummary.antiPatterns.recommendations[1]` *(если существует)*
  - ... *(перебрать все элементы массива metricsSummary.antiPatterns.recommendations, если они есть)*
- **Уверенность:** `metricsSummary.antiPatterns.confidence`

## Общий итоговый вывод
*(Данные берутся из файла example_total_summary.json)*

**Общая оценка:** `HAVE_TO_CALCULATE.totalScore` <- считается как взвешенное среднее по всем трем метрикам

**Положительные моменты:**
- `positives[0]`
- `positives[1]`
- ... *(перебрать все элементы массива positives)*

**Области для улучшения:**
- `areas_for_improvement[0]`
- `areas_for_improvement[1]`
- ... *(перебрать все элементы массива areas_for_improvement)*