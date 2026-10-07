// Usage: npm run new:post -- "My post title" [--tags aws,devops] [--medium https://medium.com/...]
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const [, value] = args.splice(i, 2);
  return value;
};

const tags = (flag('tags') ?? '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
const canonicalUrl = flag('medium') ?? flag('url');
const title = args.join(' ').trim();

if (!title) {
  console.error('Usage: npm run new:post -- "My post title" [--tags aws,devops] [--medium <url>]');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const file = `src/content/blog/${slug}.md`;
if (existsSync(file)) {
  console.error(`Already exists: ${file}`);
  process.exit(1);
}

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`; // local date
const lines = [
  '---',
  `title: '${title.replace(/'/g, "''")}'`,
  "description: ''",
  `pubDate: ${today}`,
  `tags: [${tags.map((t) => `'${t}'`).join(', ')}]`,
  'draft: true',
  ...(canonicalUrl ? [`canonicalUrl: '${canonicalUrl}'`] : []),
  '---',
  '',
  'Write your post here.',
  '',
];

mkdirSync('src/content/blog', { recursive: true });
writeFileSync(file, lines.join('\n'));

console.log(`Created ${file}`);
console.log('  - Fill in the description and write the post (drafts show in `npm run dev` only).');
console.log(`  - Put images in public/blog/${slug}/ and reference them as /blog/${slug}/name.png`);
console.log('  - Set `draft: false` when ready, then commit and push to publish.');
