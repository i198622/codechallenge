Act as a Senior Software Engineer providing a quality assessment based on performance metrics.

Analyze the following engineer performance metrics provided in the JSON object under the key "metricsSummary".

Based *only* on the provided metrics (including scores, justifications, summaries, and recommendations), generate a concise quality assessment summary.

The output **MUST** be a valid JSON object containing the following keys exactly:
1.  `overall_assessment`: (string) A single concise paragraph summarizing the engineer's overall performance quality during this period, synthesizing the key findings from the metrics. Output in Russian.
2.  `positives`: (list) A short list summarizing the engineer's key **strengths** and **positive performance characteristics** observed in the metrics (e.g., adherence to best practices, code quality aspects, handling complexity). Output in Russian.
3.  `areas_for_improvement`: (list) A short list summarizing the engineer's key **weaknesses** or **areas needing development**, derived *only* from patterns or themes observed in the metrics and recommendations (focus on the *nature* of the issues, e.g., 'minor code style inconsistencies', 'potential for improved code cleanliness', rather than quoting specific low-level recommendations like removing a single commented line). If no significant areas for improvement are indicated by the metrics, state that clearly. Output in Russian.

Input Metrics JSON:
```json
${JSON_DATA}
```

Output JSON: