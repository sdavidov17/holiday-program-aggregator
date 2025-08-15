#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generate a comprehensive HTML test report from CTRF JSON
 */
function generateHTMLReport() {
  const coverageDir = path.join(__dirname, '..', 'coverage');
  // Try multiple possible locations for CTRF report
  const possiblePaths = [
    path.join(coverageDir, 'ctrf-report.json'),
    path.join(__dirname, '..', 'ctrf', 'ctrf-report.json'),
    path.join(__dirname, '..', 'ctrf-report.json'),
  ];

  let ctrfJsonPath;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      ctrfJsonPath = p;
      break;
    }
  }

  if (!ctrfJsonPath) {
    console.error('CTRF JSON report not found in any expected location. Run tests first.');
    console.error('Searched locations:', possiblePaths);
    process.exit(1);
  }

  const htmlOutputPath = path.join(coverageDir, 'test-report.html');

  const ctrf = JSON.parse(fs.readFileSync(ctrfJsonPath, 'utf8'));
  const summary = ctrf.summary || {};

  // Calculate percentages
  const passRate = summary.tests > 0 ? ((summary.passed / summary.tests) * 100).toFixed(1) : 0;

  // Group tests by suite and categorize by test type
  const testsBySuite = {};
  const testsByType = {
    unit: [],
    integration: [],
    api: [],
    component: [],
    security: [],
    helpers: [],
  };

  (ctrf.tests || []).forEach((test) => {
    const suite = test.suite || 'Unknown Suite';
    if (!testsBySuite[suite]) {
      testsBySuite[suite] = {
        passed: 0,
        failed: 0,
        skipped: 0,
        tests: [],
      };
    }
    testsBySuite[suite].tests.push(test);
    if (test.status === 'passed') testsBySuite[suite].passed++;
    else if (test.status === 'failed') testsBySuite[suite].failed++;
    else if (test.status === 'skipped') testsBySuite[suite].skipped++;

    // Categorize by test type based on file path
    const filePath = test.filePath || suite.toLowerCase();
    if (filePath.includes('integration')) {
      testsByType.integration.push(test);
    } else if (filePath.includes('/api/') || filePath.includes('routers')) {
      testsByType.api.push(test);
    } else if (filePath.includes('components') || filePath.includes('pages')) {
      testsByType.component.push(test);
    } else if (filePath.includes('security') || filePath.includes('auth')) {
      testsByType.security.push(test);
    } else if (filePath.includes('helpers') || filePath.includes('mocks')) {
      testsByType.helpers.push(test);
    } else {
      testsByType.unit.push(test);
    }
  });

  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report - Holiday Heroes</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 2.5rem;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 0.5rem;
      text-align: center;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      color: #666;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .passed { color: #10b981; }
    .failed { color: #ef4444; }
    .skipped { color: #f59e0b; }
    .pending { color: #6b7280; }
    
    .suite {
      background: white;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .suite-header {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .suite-header:hover {
      background: #f3f4f6;
    }
    .suite-title {
      font-weight: 600;
      color: #333;
    }
    .suite-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
    }
    .test-list {
      padding: 0.5rem 0;
      display: none;
    }
    .suite.expanded .test-list {
      display: block;
    }
    .test {
      padding: 0.75rem 1.5rem;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .test:last-child {
      border-bottom: none;
    }
    .test-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .test-status.passed { background: #10b981; }
    .test-status.failed { background: #ef4444; }
    .test-status.skipped { background: #f59e0b; }
    .test-name {
      flex: 1;
      color: #333;
      font-size: 0.875rem;
    }
    .test-duration {
      color: #666;
      font-size: 0.75rem;
    }
    
    .coverage-section {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      margin-top: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .coverage-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .coverage-item {
      text-align: center;
    }
    .coverage-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin: 0.5rem 0;
    }
    .coverage-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #34d399);
      border-radius: 4px;
    }
    .timestamp {
      color: #666;
      font-size: 0.875rem;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎄 Holiday Heroes Test Report</h1>
      <div class="summary">
        <div class="stat-card">
          <div class="stat-value">${summary.tests || 0}</div>
          <div class="stat-label">Total Tests</div>
        </div>
        <div class="stat-card">
          <div class="stat-value passed">${summary.passed || 0}</div>
          <div class="stat-label">Passed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value failed">${summary.failed || 0}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value skipped">${summary.skipped || 0}</div>
          <div class="stat-label">Skipped</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${passRate}%</div>
          <div class="stat-label">Pass Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${((summary.stop - summary.start) / 1000).toFixed(2)}s</div>
          <div class="stat-label">Duration</div>
        </div>
      </div>
      <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
    </div>
    
    ${Object.entries(testsBySuite)
      .map(
        ([suiteName, suite]) => `
      <div class="suite" onclick="this.classList.toggle('expanded')">
        <div class="suite-header">
          <div class="suite-title">${suiteName}</div>
          <div class="suite-stats">
            <span class="passed">✓ ${suite.passed}</span>
            <span class="failed">✗ ${suite.failed}</span>
            <span class="skipped">⊘ ${suite.skipped}</span>
          </div>
        </div>
        <div class="test-list">
          ${suite.tests
            .map(
              (test) => `
            <div class="test">
              <div class="test-status ${test.status}"></div>
              <div class="test-name">${test.name}</div>
              <div class="test-duration">${test.duration ? test.duration + 'ms' : ''}</div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `,
      )
      .join('')}
    
    <div class="coverage-section">
      <h2>Test Coverage by Layer</h2>
      <div class="coverage-grid">
        <div class="coverage-item">
          <div class="stat-label">Unit Tests</div>
          <div class="coverage-bar">
            <div class="coverage-fill" style="width: ${testsByType.unit.length > 0 ? ((testsByType.unit.filter((t) => t.status === 'passed').length / testsByType.unit.length) * 100).toFixed(0) : 0}%"></div>
          </div>
          <div>${testsByType.unit.length} tests</div>
        </div>
        <div class="coverage-item">
          <div class="stat-label">Integration</div>
          <div class="coverage-bar">
            <div class="coverage-fill" style="width: ${testsByType.integration.length > 0 ? ((testsByType.integration.filter((t) => t.status === 'passed').length / testsByType.integration.length) * 100).toFixed(0) : 0}%"></div>
          </div>
          <div>${testsByType.integration.length} tests</div>
        </div>
        <div class="coverage-item">
          <div class="stat-label">API Routes</div>
          <div class="coverage-bar">
            <div class="coverage-fill" style="width: ${testsByType.api.length > 0 ? ((testsByType.api.filter((t) => t.status === 'passed').length / testsByType.api.length) * 100).toFixed(0) : 0}%"></div>
          </div>
          <div>${testsByType.api.length} tests</div>
        </div>
        <div class="coverage-item">
          <div class="stat-label">Components</div>
          <div class="coverage-bar">
            <div class="coverage-fill" style="width: ${testsByType.component.length > 0 ? ((testsByType.component.filter((t) => t.status === 'passed').length / testsByType.component.length) * 100).toFixed(0) : 0}%"></div>
          </div>
          <div>${testsByType.component.length} tests</div>
        </div>
        <div class="coverage-item">
          <div class="stat-label">Security</div>
          <div class="coverage-bar">
            <div class="coverage-fill" style="width: ${testsByType.security.length > 0 ? ((testsByType.security.filter((t) => t.status === 'passed').length / testsByType.security.length) * 100).toFixed(0) : 0}%"></div>
          </div>
          <div>${testsByType.security.length} tests</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlOutputPath, html);
  console.log(`✅ HTML test report generated: ${htmlOutputPath}`);

  // Also generate a markdown summary for CI
  const markdown = `# Test Report Summary

## 📊 Overall Statistics
- **Total Tests**: ${summary.tests || 0}
- **Passed**: ${summary.passed || 0} ✅
- **Failed**: ${summary.failed || 0} ❌
- **Skipped**: ${summary.skipped || 0} ⚠️
- **Pass Rate**: ${passRate}%
- **Duration**: ${((summary.stop - summary.start) / 1000).toFixed(2)}s

## 📦 Test Suites
${Object.entries(testsBySuite)
  .map(([suite, data]) => `- **${suite}**: ${data.passed}/${data.tests.length} passed`)
  .join('\n')}

## 🔍 Coverage Layers
- Unit Tests: ${testsByType.unit.length} tests (${testsByType.unit.filter((t) => t.status === 'passed').length} passed)
- Integration Tests: ${testsByType.integration.length} tests (${testsByType.integration.filter((t) => t.status === 'passed').length} passed)
- API Routes: ${testsByType.api.length} tests (${testsByType.api.filter((t) => t.status === 'passed').length} passed)
- Components: ${testsByType.component.length} tests (${testsByType.component.filter((t) => t.status === 'passed').length} passed)
- Security: ${testsByType.security.length} tests (${testsByType.security.filter((t) => t.status === 'passed').length} passed)

_Generated at ${new Date().toISOString()}_
`;

  fs.writeFileSync(path.join(coverageDir, 'test-summary.md'), markdown);
  console.log('✅ Markdown summary generated');
}

generateHTMLReport();
