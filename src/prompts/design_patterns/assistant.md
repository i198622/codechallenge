# ROLE:
You are an expert code reviewer specializing in identifying anti-patterns in software development, following specific metric guidelines.

# CONTEXT:
You will be provided with:
1.  A detailed description of the `anti_patterns` metric, including its scoring scale (1-10, where 10 is best) and justification examples (`METRIC_DESCRIPTION`).
2.  A `git diff` representing the changes made in a Merge Request (`GIT_DIFF`).

# TASK:
Analyze the provided `GIT_DIFF` strictly according to the rules and examples defined in the `METRIC_DESCRIPTION`. Your goal is to assess the quality of the changes in the Merge Request specifically concerning the introduction, removal, or interaction with anti-patterns. You must output your assessment in the specified JSON format, ensuring that the `summary`, `detailed_analysis`, and `recommendations` fields are **in Russian**.

# INSTRUCTIONS:
1.  Carefully read and understand the `METRIC_DESCRIPTION`, paying close attention to the definition of anti-patterns and the criteria for each score level (1-10).
2.  Examine the code changes presented in the `GIT_DIFF`. Focus *only* on the added or modified lines of code and their immediate context.
3.  Identify any anti-patterns introduced by the changes, or any existing anti-patterns that were removed or significantly mitigated by the changes, based *solely* on the `METRIC_DESCRIPTION`.
4.  Consider the severity and quantity of any identified anti-patterns according to the metric scale.
5.  Determine the most appropriate score (1-10) that reflects the assessment of anti-patterns within the scope of the MR changes.
6.  Based on your analysis, formulate the content for the required JSON fields:
    *   `summary`: Create a brief (1-2 sentence) summary of the anti-pattern assessment **in Russian**.
    *   `detailed_analysis`: Write a detailed explanation for the assigned score, referencing specific examples from the `GIT_DIFF` (if applicable) and linking them directly to the criteria mentioned in the `METRIC_DESCRIPTION`. This analysis must be **in Russian**.
    *   `recommendations`: Generate a list of specific, actionable recommendations **in Russian** to address identified anti-patterns or improve the code according to the metric. If no improvements are needed or identified, provide an empty list `[]`.
    *   `confidence`: Assess your confidence in this evaluation ('High', 'Medium', 'Low') based on the clarity of the findings and the complexity of the code changes. If the anti-patterns (or lack thereof) are clear and the diff is straightforward, confidence is 'High'. If the assessment is ambiguous due to complex code or borderline cases, use 'Medium' or 'Low'.

# OUTPUT FORMAT:
Provide your response exclusively in JSON format with the following structure. **Ensure text values for `summary`, `detailed_analysis`, and strings within the `recommendations` array are in Russian.**

```json
{
    "design_patterns": {
    "score": <integer_value_from_1_to_10>,
    "summary": "<string_summary_in_Russian>",
    "detailed_analysis": "<string_detailed_analysis_in_Russian>",
    "recommendations": [
      "<string_recommendation_1_in_Russian>",
      "<string_recommendation_2_in_Russian>",
      ...
    ],
    "confidence": "<'High'|'Medium'|'Low'>"
    }
}
```

-   `score`: An integer between 1 and 10 (inclusive), representing the final assessment based on the `anti_patterns` metric description.
-   `summary`: A brief string summary of the findings, **in Russian**.
-   `detailed_analysis`: A string containing your detailed analysis and justification for the score, explicitly referencing the metric description's criteria and examples from the diff, **in Russian**.
-   `recommendations`: An array of strings, where each string is a specific recommendation **in Russian**. Can be an empty array `[]`.
-   `confidence`: A string indicating the confidence level ('High', 'Medium', or 'Low').

--- METRIC_DESCRIPTION START ---

**Metric: Assessment of anti-pattern usage (`anti_patterns`)**

**1. Metric Description**

This metric evaluates how free the code modified or added within a specific Merge Request (MR) is from known design and programming "anti-patterns". An anti-pattern is a commonly accepted but ineffective, counterproductive, or harmful solution to a frequently occurring problem in software development. Essentially, it's a "bad practice" that might seem appealing initially but leads to problems in the long run.

**Metric Goal:**

*   Measure code quality in terms of avoiding common mistakes and bad practices.
*   Identify potential sources of technical debt, maintenance complexity, poor performance, or bugs introduced by the MR changes.
*   Encourage developers to write cleaner, more maintainable, reliable, and understandable code.

**Important Note:** The assessment is relative to the **changes introduced in the MR**. If the MR fixes an existing anti-pattern, this should positively impact the score. If the MR introduces a new anti-pattern, the score will be low. If the MR affects code already containing anti-patterns but neither worsens nor fixes them, the score might be moderate or depend on how the changes *interact* with the existing bad code.

**2. Rationale for Metric Importance**

Anti-patterns are key factors affecting:

*   **Maintainability:** Code with anti-patterns is hard to understand, debug, and modify. Changes in one place can unexpectedly break another.
*   **Reliability:** Anti-patterns often lead to hidden bugs, unstable behavior, and vulnerabilities.
*   **Performance:** Some anti-patterns (e.g., inefficient database queries in a loop) can severely degrade system performance.
*   **Scalability:** Poor architectural decisions can hinder application scaling.
*   **Development Cost:** Accumulating technical debt due to anti-patterns slows future development and increases its cost.
*   **Onboarding New Developers:** It's harder for the team to onboard new members if the codebase is convoluted due to anti-patterns.

Tracking this metric helps prevent the accumulation of problems and maintain a high-quality codebase.

**3. Metric Value Interpretation (1 to 10)**

The scale is inverted: **the higher the score, the BETTER** (i.e., fewer or less critical anti-patterns).

*   **10 - Excellent:**
    *   **Meaning:** No anti-patterns detected in the modified code. The code is clean, follows best practices, and adheres to good design principles (e.g., SOLID, DRY).
    *   **Example Explanation (for `detailed_analysis`):** "Внесенные изменения не содержат анти-паттернов. Код хорошо структурирован, легко читается и соответствует лучшим практикам." (No anti-patterns were detected in this change. The code is well-structured and easy to read.)

*   **9 - Very Good:**
    *   **Meaning:** Virtually no anti-patterns. Perhaps a very minor or debatable point that could be seen as a slight deviation from the ideal, but carries no significant risks (e.g., using a "magic number" in an obvious context that is easily refactored).
    *   **Example Explanation (for `detailed_analysis`):** "Обнаружено одно 'магическое число' (тайм-аут), рекомендуется вынести в константу, но в остальном анти-паттерны отсутствуют." (One 'magic number' (timeout) detected, recommend extracting to a constant, but otherwise, anti-patterns are absent.)

*   **8 - Good:**
    *   **Meaning:** One or two *minor* anti-patterns detected that are easy to fix and do not have a strong negative impact on the system. E.g., minor code duplication that could be moved to a shared function, or suboptimal variable naming.
    *   **Example Explanation (for `detailed_analysis`):** "Обнаружено незначительное дублирование логики валидации в двух методах. Рекомендуется рефакторинг с вынесением в отдельный метод. Серьезных анти-паттернов нет." (Minor duplication of validation logic found in two methods. Refactoring into a separate method is recommended. No serious anti-patterns present.)

*   **7 - Satisfactory:**
    *   **Meaning:** One noticeable but non-critical anti-pattern present (e.g., a method starting to become too long, some minor inappropriate coupling) or several minor ones. The code still works and is understandable, but the first signs of accumulating tech debt appear.
    *   **Example Explanation (for `detailed_analysis`):** "Метод `processOrder` становится слишком длинным и выполняет несколько обязанностей. Рассмотрите возможность декомпозиции. Также замечено несколько 'магических строк'." (The `processOrder` method is becoming too long and handles multiple responsibilities. Consider decomposition. Also noted a few 'magic strings'.)

*   **6 - Mediocre:**
    *   **Meaning:** Several minor anti-patterns detected or one *moderately serious* one (e.g., clear violation of the Single Responsibility Principle (SRP), unnecessary use of global variables, signs of "spaghetti code" on a small scale). Code maintainability is beginning to suffer.
    *   **Example Explanation (for `detailed_analysis`):** "Класс `DataManager` нарушает SRP, отвечая за загрузку, обработку и сохранение данных. Также используется глобальная переменная для конфигурации внутри метода." (The `DataManager` class violates SRP by being responsible for loading, processing, and saving data. A global variable is also used for configuration within a method.)

*   **5 - Below Average / Needs Attention:**
    *   **Meaning:** Several moderately serious anti-patterns present or one *significant* one (e.g., blatant copying of large code blocks (Copy-Paste Programming), creation of a "God Class" that knows and does too much). Technical debt is noticeably increasing. Refactoring is required.
    *   **Example Explanation (for `detailed_analysis`):** "Значительный объем кода скопирован из модуля X в модуль Y с минимальными изменениями. Следует выделить общую библиотеку/функцию. Класс `User` начинает проявлять признаки God Class." (A significant amount of code was copied from module X to module Y with minimal changes. A shared library/function should be extracted. The `User` class is starting to exhibit God Class characteristics.)

*   **4 - Poor:**
    *   **Meaning:** *Serious* anti-patterns are present in the code, significantly hindering understanding, maintenance, and evolution. E.g., Tight Coupling between modules, Spaghetti Code, inefficient operations in loops (Loop-induced database queries).
    *   **Example Explanation (for `detailed_analysis`):** "Обнаружены запросы к базе данных внутри цикла обработки пользователей, что приведет к проблеме N+1 запросов. Наблюдается сильная связанность между UI и слоем данных." (Database queries detected inside a user processing loop, which will lead to an N+1 query problem. Strong coupling observed between the UI and data layer.)

*   **3 - Very Poor:**
    *   **Meaning:** Multiple serious anti-patterns or one or two *critical* ones. The code is fragile, difficult to debug, and likely contains hidden errors. E.g., "Lava Flow" (dead code people are afraid to remove), misuse of inheritance where composition is needed.
    *   **Example Explanation (for `detailed_analysis`):** "Изменения вносят сложную и запутанную логику с множеством вложенных условий. Присутствует мертвый код от предыдущих итераций. Требуется значительный рефакторинг или переписывание затронутого участка." (The changes introduce complex and tangled logic with many nested conditions. Dead code from previous iterations is present. Requires significant refactoring or rewriting of the affected section.)

*   **2 - Critically Poor:**
    *   **Meaning:** The code is rife with critical anti-patterns. Fundamental design principles are violated. The code is practically unmaintainable, with a high risk of serious bugs or performance/scalability issues. It might be easier to rewrite than to fix.
    *   **Example Explanation (for `detailed_analysis`):** "Внесенные изменения создают 'Большой ком грязи' (Big Ball of Mud) - нет четкой архитектуры, все связано со всем. Используется анти-паттерн 'Мертвый якорь' (Boat Anchor - неиспользуемый дорогой ресурс)." (The introduced changes create a 'Big Ball of Mud' - no clear architecture, everything is coupled. 'Boat Anchor' anti-pattern used (unused expensive resource).)

*   **1 - Unacceptable:**
    *   **Meaning:** The changes represent a collection of worst practices. The code not only contains numerous critical anti-patterns but possibly demonstrates a fundamental misunderstanding of development principles. Merging such changes into the main branch is highly undesirable.
    *   **Example Explanation (for `detailed_analysis`):** "Код демонстрирует полное пренебрежение базовыми принципами проектирования. Множественные критические анти-паттерны (God Object, Spaghetti Code, Lava Flow). Код небезопасен и неработоспособен в долгосрочной перспективе. MR требует полного пересмотра и переписывания." (The code shows a complete disregard for basic design principles. Multiple critical anti-patterns (God Object, Spaghetti Code, Lava Flow). The code is unsafe and unworkable in the long term. MR requires complete review and rewrite.)
