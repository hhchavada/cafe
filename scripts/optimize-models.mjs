import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

async function run() {
    const inputDir = 'original-models';
    const outputDir = 'optimized-models';

    if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // Check for --only flag
    const args = process.argv.slice(2);
    const onlyArgIndex = args.indexOf('--only');
    const onlyFile = onlyArgIndex !== -1 ? args[onlyArgIndex + 1] : null;

    let files = fs.readdirSync(inputDir).filter(f => f.toLowerCase().endsWith('.glb'));

    if (onlyFile) {
        files = files.filter(f => f === onlyFile);
        if (files.length === 0) {
            console.error(`❌ File ${onlyFile} not found in ${inputDir}`);
            process.exit(1);
        }
    }

    if (files.length === 0) {
        console.log("\n❌ No .glb files found in 'original-models' folder.");
        process.exit(1);
    }

    console.log(`\n🚀 Found ${files.length} models. Starting production compression pipeline...\n`);

    const io = new NodeIO()
        .registerExtensions(KHRONOS_EXTENSIONS)
        .registerDependencies({
            'draco3d.decoder': await draco3d.createDecoderModule(),
            'draco3d.encoder': await draco3d.createEncoderModule(),
        });

    const summaryReport = [];

    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);

        console.log(`=========================================`);
        console.log(`🔍 Processing: ${file}...`);

        try {
            const document = await io.read(inputPath);
            const root = document.getRoot();

            const baseColorTextures = new Set();
            const normalTextures = new Set();
            const metallicRoughnessTextures = new Set();
            
            for (const material of root.listMaterials()) {
                const bc = material.getBaseColorTexture();
                if (bc) baseColorTextures.add(bc);
                
                const norm = material.getNormalTexture();
                if (norm) normalTextures.add(norm);
                
                const mr = material.getMetallicRoughnessTexture();
                if (mr) metallicRoughnessTextures.add(mr);
            }

            const textureStats = [];

            for (const texture of root.listTextures()) {
                const image = texture.getImage();
                if (!image) {
                    console.log('  [Warning] Texture has no image bytes');
                    continue;
                }

                let role = "Unknown";
                if (baseColorTextures.has(texture)) role = "Base Color";
                else if (normalTextures.has(texture)) role = "Normal";
                else if (metallicRoughnessTextures.has(texture)) role = "Metallic Roughness";
                else role = "Other";

                const originalBytes = image.byteLength;
                let originalWidth = 'Unknown';
                let originalHeight = 'Unknown';
                let newWidth = 'Unknown';
                let newHeight = 'Unknown';
                let newBytes = originalBytes;

                try {
                    const meta = await sharp(Buffer.from(image)).metadata();
                    originalWidth = meta.width;
                    originalHeight = meta.height;

                    let targetSize = 1024;
                    if (role === "Base Color") targetSize = 2048;

                    if (originalWidth > targetSize || originalHeight > targetSize) {
                        const newBuffer = await sharp(Buffer.from(image))
                            .resize(targetSize, targetSize, {
                                fit: 'inside', // Safely inside without distorting
                                withoutEnlargement: true
                            })
                            .jpeg({
                                quality: 85,
                                mozjpeg: true
                            })
                            .toBuffer();

                        texture.setImage(new Uint8Array(newBuffer));
                        texture.setMimeType('image/jpeg');
                        const uri = texture.getURI() || 'texture.jpg';
                        texture.setURI(uri.replace(/\.(png|webp)$/i, '.jpg'));

                        const newMeta = await sharp(newBuffer).metadata();
                        newWidth = newMeta.width;
                        newHeight = newMeta.height;
                        newBytes = newBuffer.length;
                    } else {
                        newWidth = originalWidth;
                        newHeight = originalHeight;
                    }
                    
                    textureStats.push({ role, originalBytes, newBytes, originalWidth, originalHeight, newWidth, newHeight });
                } catch (e) {
                    console.error(`\n❌ Sharp failed on texture [${role}]: ${e.message}`);
                    process.exit(1);
                }
            }

            // Safe optimizations are skipped to avoid GLib GObject crashes caused by @gltf-transform/functions loading Squoosh

            await io.write(outputPath, document);

            // Validation test
            try {
                const validationDoc = await io.read(outputPath);
                const valRoot = validationDoc.getRoot();
                
                let valid = true;
                for (const tex of valRoot.listTextures()) {
                    const img = tex.getImage();
                    if (img) {
                        try {
                            const meta = await sharp(Buffer.from(img)).metadata();
                            if (!meta.width || !meta.height) valid = false;
                        } catch(e) {
                            valid = false;
                        }
                    }
                }
                if (!valid) {
                    console.log(`\n❌ ERROR: Validation failed for ${file}. Textures corrupt.`);
                    continue;
                }
            } catch (e) {
                console.error(`  [Validation Error] Output GLB is corrupt for ${file}: ${e.message}`);
                continue;
            }

            const oldSizeMB = (fs.statSync(inputPath).size / (1024 * 1024));
            const newSizeMB = (fs.statSync(outputPath).size / (1024 * 1024));
            const reduction = ((oldSizeMB - newSizeMB) / oldSizeMB) * 100;

            console.log(`✅ Success: ${file}`);
            console.log(`📉 Reduction: ${oldSizeMB.toFixed(2)} MB -> ${newSizeMB.toFixed(2)} MB (${reduction.toFixed(1)}%)`);

            summaryReport.push({
                Model: file,
                Original: `${oldSizeMB.toFixed(2)} MB`,
                Optimized: `${newSizeMB.toFixed(2)} MB`,
                Reduction: `${reduction.toFixed(1)}%`
            });

        } catch (err) {
            console.error(`❌ Error processing ${file}:`, err);
        }
    }

    if (summaryReport.length > 0) {
        console.log(`\n\n📊 ================= FINAL SIZE REPORT ================= 📊\n`);
        console.table(summaryReport);
        console.log(`\n🎉 Process complete! Check the 'optimized-models' directory.`);
    }
}

run().catch(console.error);
