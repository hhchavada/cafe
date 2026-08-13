import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const inputDir = path.join(process.cwd(), 'input_models');
const outputDir = path.join(process.cwd(), 'output_models');

// Create directories if they don't exist
if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.glb'));

if (files.length === 0) {
    console.log("\n❌ Koi .glb files nahi mili 'input_models' folder mein.");
    console.log("👉 PLEASE READ: Apni sabhi badi (heavy) .glb files ko copy karke 'input_models' folder ke andar paste karein.");
    console.log("👉 Uske baad is script ko dobara run karein: npm run compress\n");
    process.exit(1);
}

console.log(`\n🚀 Found ${files.length} models. Starting compression...`);
console.log("⚠️ Isme kuch minutes lag sakte hain (files bahut badi hain), please wait...\n");

for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    
    console.log(`⏳ Compressing: ${file}...`);
    try {
        // Optimize geometry and resize textures to max 1024x1024 (removed webp due to colourspace error)
        const cmd = `npx -y @gltf-transform/cli optimize "${inputPath}" "${outputPath}" --texture-size 1024`;
        execSync(cmd, { stdio: 'inherit' });
        
        // Print size difference
        const oldSize = (fs.statSync(inputPath).size / (1024 * 1024)).toFixed(2);
        const newSize = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
        
        console.log(`✅ Success: ${file}`);
        console.log(`📉 Size reduced: ${oldSize} MB  --->  ${newSize} MB\n`);
    } catch (err) {
        console.log(`❌ Error compressing ${file}: ${err.message}\n`);
    }
}

console.log("🎉 All done! Apni compressed files 'output_models' folder mein check karein aur unhein DigitalOcean par upload kar dein.");
