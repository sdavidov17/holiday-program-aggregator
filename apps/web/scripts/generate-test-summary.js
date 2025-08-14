#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateTestSummary() {
  try {
    // Read CTRF report if it exists
    const ctrfPath = path.join(__dirname, '../coverage/ctrf-report.json');
    
    if (fs.existsSync(ctrfPath)) {
      const ctrf = JSON.parse(fs.readFileSync(ctrfPath, 'utf8'));
      
      const summary = ctrf.results?.summary || {};
      const tests = summary.tests || 0;
      const passed = summary.passed || 0;
      const failed = summary.failed || 0;
      const skipped = summary.skipped || 0;
      const pending = summary.pending || 0;
      const duration = summary.duration || 0;
      
      const passRate = tests > 0 ? ((passed / tests) * 100).toFixed(1) : 0;
      const status = failed === 0 ? '✅' : '❌';
      
      const summaryMd = `## Test Results ${status}

### Summary
- **Total Tests**: ${tests}
- **Passed**: ${passed} (${passRate}%)
- **Failed**: ${failed}
- **Skipped**: ${skipped}
- **Pending**: ${pending}
- **Duration**: ${(duration / 1000).toFixed(2)}s

### Test Report
- **Test Type**: ${ctrf.results?.tool?.name || 'Jest'}
- **Environment**: ${ctrf.results?.environment || 'test'}
- **Build**: ${ctrf.results?.build || 'local'}
`;

      // Write to GitHub step summary if available
      if (process.env.GITHUB_STEP_SUMMARY) {
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMd);
      }
      
      // Also write to stdout
      console.log(summaryMd);
    } else {
      console.log('No CTRF report found');
    }
    
    // Read coverage summary if it exists
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
    
    if (fs.existsSync(coveragePath)) {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      const total = coverage.total;
      
      const coverageMd = `
### Coverage Report
- **Lines**: ${total.lines.pct}%
- **Statements**: ${total.statements.pct}%
- **Functions**: ${total.functions.pct}%
- **Branches**: ${total.branches.pct}%
`;
      
      if (process.env.GITHUB_STEP_SUMMARY) {
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, coverageMd);
      }
      
      console.log(coverageMd);
    }
    
  } catch (error) {
    console.error('Error generating test summary:', error);
  }
}

generateTestSummary();