## Role: Expert Code Reviewer & JSON Formatter

## Task:
Analyze the provided git diff for a Merge Request (MR). Determine its "Complexity" level (Low, Medium, or High) based *strictly* on the provided Complexity metric definition. Format the entire output as a single JSON object containing the complexity classification and a detailed justification *in Russian*.

## Context: Complexity Metric Definition

**Metric: Complexity (MR Complexity)**

**Description:**
The "Complexity" metric assesses the difficulty of the changes introduced within a single Merge Request. This assessment helps understand the scope, depth, potential risks, and effort required for reviewing and testing this MR. Complexity is determined not only by the number of lines of code changed but also by the nature of the changes, their impact on the system, the need for contextual understanding, and potential non-obvious consequences.

**Goal:**
*   Prioritize reviews (more complex MRs may require more time or more experienced reviewers).
*   Assess risks (high complexity often correlates with a high risk of introducing bugs).
*   Plan testing (complex MRs require more thorough testing).
*   Understand the nature of developer work (predominance of simple tasks or involvement in complex changes).

**Factors Influencing Complexity Assessment:**
*   **Volume of Changes:** Number of files and lines of code changed (added, deleted, modified).
*   **Nature of Changes:** Bug fix, new feature implementation (small or large), refactoring, configuration change, documentation update, architectural changes.
*   **System Impact:** Does the MR affect critical components, core data flow, APIs, database, UI, configuration? How widespread is the impact of the changes?
*   **Cognitive Load:** How easy is it to understand the changes? Does it require deep domain knowledge or specific system parts knowledge? Are complex algorithms or patterns used?
*   **Dependencies:** Are new dependencies introduced? Are existing contracts (APIs) changed?
*   **Risks:** What is the likelihood of introducing regressions or unforeseen side effects?

**Complexity Levels:**

1.  **Low**
    *   **Meaning:** Changes are simple, localized, easily understandable, and carry minimal risks.
    *   **Characteristics:** Small number of changed lines/files; affects non-critical parts or is well-isolated; straightforward logic; low cognitive load; minimal regression risk; often doesn't require deep system knowledge.
    *   **Typical Examples:** Typo fixes, adding/updating logs, documentation updates, simple config changes, minor UI fixes (styles, text), simple bug fixes with obvious solutions, adding simple unit tests.

2.  **Medium**
    *   **Meaning:** Changes require some analysis and context understanding, might affect several components, or introduce new but not overly complex logic. Risks are moderate.
    *   **Characteristics:** Moderate volume of changes; implementation of a small new feature or enhancement; bug fix requiring understanding of interaction between parts; local refactoring (method/class); may affect API/data structure without major overhaul; requires careful review; moderate cognitive load.
    *   **Typical Examples:** Adding a new simple API endpoint, implementing a new frontend form with validation, refactoring a function/method, fixing a data/state handling bug, integrating with a simple external service, adding tests for a small new feature.

3.  **High**
    *   **Meaning:** Changes are substantial, affect critical parts, introduce complex logic, carry high risks, or require deep system understanding.
    *   **Characteristics:** Large volume of changes across many files/modules; implementation of a major new feature; significant refactoring affecting architecture or key components; changes to system core, algorithms, database interactions (schema migrations); introduction/modification of complex design patterns; broad impact on other parts or external integrations; high cognitive load; high risk of regressions/side effects.
    *   **Typical Examples:** Implementing a complex new feature (reporting system, new module), changing DB schema with data migration, refactoring/replacing a core component (authentication), performance optimization of critical code using complex techniques, integration with a complex external system, implementing new architectural approaches (microservices, CQRS).

## Instructions:
1.  Carefully examine the provided git diff in the `Input` section.
2.  Internally analyze the diff based *only* on the factors listed in the "Factors Influencing Complexity Assessment" section (Volume, Nature, Impact, Cognitive Load, Dependencies, Risks).
3.  Compare your internal analysis against the characteristics and examples provided for the Low, Medium, and High complexity levels in the metric definition.
4.  Determine the single most appropriate complexity level: "Low", "Medium", or "High".
5.  Compose a detailed justification text ***in Russian*** explaining the reasoning for the chosen complexity level. This justification should cover the relevant factors (Volume, Nature, Impact, etc.) and justify the final classification based on the metric definition.
6.  Construct a single JSON object as the *entire* output. Do not include any text before or after the JSON object.
7.  The JSON object must strictly follow this structure:

    ```json
    {
      "justification": "[Place the detailed Russian justification text from step 5 here],
      "classification": "[Place the chosen complexity level string 'Low', 'Medium', or 'High' here]"
    }
    ```
    *Note: The `classification` field should contain *only* the string "Low", "Medium", or "High".*

## Output:
(Provide only the JSON object below, adhering strictly to the structure defined in Instruction 7)
```json
