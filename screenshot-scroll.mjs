import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = 'http://localhost:3000/index.html';
const width = 1440;
const height = 900;

const screenshotDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const existing = fs.readdirSync(screenshotDir).filter(f => f.match(/^screenshot-\d/));
const nums = existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] || '0')).filter(n => !isNaN(n));
const next = nums.length ? Math.max(...nums) + 1 : 1;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width, height });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Screenshot 1: Initial viewport (hero)
const path1 = path.join(screenshotDir, `screenshot-${next}-hero.png`);
await page.screenshot({ path: path1 });
console.log(`Screenshot 1 (hero): ${path1}`);

// Scroll down to trigger hero expansion and reveal content
await page.evaluate(() => window.scrollTo(0, window.innerHeight));
await new Promise(r => setTimeout(r, 500));
await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
await new Promise(r => setTimeout(r, 500));
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await new Promise(r => setTimeout(r, 800));

// Screenshot 2: Full page after scroll
const path2 = path.join(screenshotDir, `screenshot-${next + 1}-fullpage.png`);
await page.screenshot({ path: path2, fullPage: true });
console.log(`Screenshot 2 (full page): ${path2}`);

await browser.close();
