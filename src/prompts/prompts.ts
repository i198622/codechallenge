import fs from 'fs';

function getFile(filename: string): string {
  let content = fs.readFileSync(process.cwd() + "/src/prompts" + filename).toString();
  return content;
}

export const AgentPrompts = {
  antiPatterns: {
    system: getFile('/anti_patterns/system.md'),
    prompt: getFile('/anti_patterns/assistant.md'),
  },
  codeStyle: {
    system: getFile('/code_style/system.md'),
    prompt: getFile('/code_style/assistant.md'),
  },
  complexity: {
    system: getFile('/complexity/system.md'),
    prompt: getFile('/complexity/assistant.md'),
  },
  designPatterns: {
    system: getFile('/design_patterns/system.md'),
    prompt: getFile('/design_patterns/assistant.md'),
  },
  employeeRreport: {
    system: getFile('/employee_report/system.md'),
    prompt: getFile('/employee_report/assistant.md'),
    systemMetricsSummary: getFile('/employee_report/system_metric_summary.md'),
    systemTotalSummary: getFile('/employee_report/system_total_summary.md'),
    promptMetricsSummary: getFile('/employee_report/assistant_metrics_summary.md'),
    promptTotalSummary: getFile('/employee_report/assistant_total_summary.md'),
    promptReportTemplate: getFile('/employee_report/employee_report_template.md'),
  },
  mrReport: {
    system: getFile('/mr_report/system.md'),
    prompt: getFile('/mr_report/assistant.md'),
  }
};