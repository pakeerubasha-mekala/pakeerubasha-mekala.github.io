// Publish from the terminal: stage everything, commit, and push main.
// GitHub Actions then rebuilds and deploys to GitHub Pages + Cloudflare Pages.
// Usage: npm run ship -- "blog: my new post"   (message optional)
import { execSync } from 'node:child_process';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });
const out = (cmd) => execSync(cmd, { encoding: 'utf8' });

const msg = process.argv.slice(2).join(' ').trim() || 'Update content';

try {
  if (!out('git status --porcelain').trim()) {
    console.log('Nothing to publish — working tree is clean.');
    process.exit(0);
  }
  const branch = out('git rev-parse --abbrev-ref HEAD').trim();
  if (branch !== 'main') {
    console.error(`On branch "${branch}", not "main". Switch to main (the deploy branch) first.`);
    process.exit(1);
  }
  run('git add -A');
  run(`git commit -m ${JSON.stringify(msg)}`);
  run('git push');
  console.log('\n✓ Pushed. GitHub Actions is building and will deploy to:');
  console.log('    https://pakeeru.pages.dev');
  console.log('    https://pakeerubasha-mekala.github.io');
} catch (e) {
  console.error('\nPublish failed:', e.message);
  process.exit(1);
}
