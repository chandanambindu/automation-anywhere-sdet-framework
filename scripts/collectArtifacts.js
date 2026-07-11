const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(process.cwd(), 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const archive = path.join(outDir, `artifacts-${ts}.tar.gz`);

try {
  // Collect known artifact folders if they exist
  const entries = ['test-results', 'reports', 'screenshots', 'traces', 'logs'].filter(p => fs.existsSync(path.resolve(process.cwd(), p)));
  if (entries.length === 0) {
    console.log('No artifacts found to collect.');
    process.exit(0);
  }
  const cmd = `tar -czf ${archive} ${entries.join(' ')}`;
  execSync(cmd, { stdio: 'inherit' });
  console.log('Artifacts collected to', archive);
} catch (e) {
  console.error('Failed to collect artifacts:', e.message);
  process.exit(1);
}
