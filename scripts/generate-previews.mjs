import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', '3d-previews');
const CHROME = String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`;
const BASE_URL = process.env.PREVIEW_BASE_URL || 'http://localhost:3000';

const PREVIEWS = [
    { slug: 'burger', model: '/web-models/burger-v1.glb' },
    { slug: 'pizza', model: '/web-models/pizza-v1.glb' },
    { slug: 'mocktail', model: '/web-models/Mint_Cucumber_Lime-v1.glb' },
    { slug: 'paneer-tikka-masala', model: '/web-models/Paneer_Comfort_Curry-v1.glb' },
    { slug: 'taiwanese-noodles', model: '/web-models/Crispy_Chili_Noodle-v1.glb' },
    { slug: 'white-sauce-pasta', model: '/web-models/Meshy_AI_Garden_Orzo_Delight_0813065557_texture-v1.glb' },
];

async function captureOne(page, { slug, model }) {
    const url = `${BASE_URL}/preview-capture.html?model=${encodeURIComponent(model)}`;
    console.log(`  rendering ${slug}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });

    await page.waitForFunction(
        () => document.body.dataset.ready === '1' || document.body.dataset.error,
        { timeout: 90000 }
    );

    const error = await page.evaluate(() => document.body.dataset.error);
    if (error) {
        throw new Error(`model-viewer failed for ${slug}: ${error}`);
    }

    const png = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: 800, height: 800 },
        omitBackground: false,
    });

    const outPath = path.join(OUT_DIR, `${slug}.webp`);
    await sharp(png).webp({ quality: 88 }).toFile(outPath);
    const mb = (fs.statSync(outPath).size / 1024).toFixed(0);
    console.log(`  saved ${slug}.webp (${mb} KB)`);
}

async function run() {
    if (!fs.existsSync(CHROME)) {
        throw new Error(`Chrome not found at ${CHROME}`);
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });

    const browser = await puppeteer.launch({
        executablePath: CHROME,
        headless: true,
        defaultViewport: { width: 800, height: 800, deviceScaleFactor: 1 },
        args: [
            '--hide-scrollbars',
            '--no-sandbox',
            '--ignore-gpu-blocklist',
            '--enable-webgl',
            '--use-angle=d3d11',
        ],
    });

    try {
        const page = await browser.newPage();
        for (const item of PREVIEWS) {
            await captureOne(page, item);
        }
    } finally {
        await browser.close();
    }

    console.log(`\nWrote ${PREVIEWS.length} previews to public/3d-previews/`);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
