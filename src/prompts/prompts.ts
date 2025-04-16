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
  },
  mrReport: {
    system: getFile('/mr_report/system.md'),
    prompt: getFile('/mr_report/assistant.md'),
  }
};