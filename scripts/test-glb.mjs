import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import fs from 'node:fs';
import sharp from 'sharp';

async function run() {
    const io = new NodeIO()
        .registerExtensions(KHRONOS_EXTENSIONS)
        .registerDependencies({
            'draco3d.decoder': await draco3d.createDecoderModule(),
            'draco3d.encoder': await draco3d.createEncoderModule(),
        });

    const inputPath = 'original-models/burger-v1.glb';
    const outputPath = 'optimized-models/burger-v1-texture-test.glb';

    console.log('=========================================');
    console.log('BURGER TEXTURE RESIZE TEST (SHARP)');
    console.log('=========================================');
    console.log(`🔍 Reading: ${inputPath}...`);

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

    const report = [];

    for (const texture of root.listTextures()) {
        const image = texture.getImage();
        if (!image) {
            console.log('  [Warning] Texture has no image bytes');
            continue;
        }

        let role = "Unknown";
        if (baseColorTextures.has(texture)) role = "Base Color";
        if (normalTextures.has(texture)) role = "Normal";
        if (metallicRoughnessTextures.has(texture)) role = "Metallic Roughness";

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

            console.log(`Processing [${role}]... (${originalWidth}x${originalHeight}) -> ${targetSize}x${targetSize}`);

            const newBuffer = await sharp(Buffer.from(image))
                .resize(targetSize, targetSize, {
                    fit: 'fill',
                    kernel: 'lanczos3'
                })
                .jpeg({
                    quality: 85,
                    mozjpeg: true
                })
                .toBuffer();

            texture.setImage(new Uint8Array(newBuffer));
            texture.setMimeType('image/jpeg');

            const newMeta = await sharp(newBuffer).metadata();
            newWidth = newMeta.width;
            newHeight = newMeta.height;
            newBytes = newBuffer.length;

            report.push({ role, originalBytes, newBytes, originalWidth, originalHeight, newWidth, newHeight });
        } catch (e) {
            console.error(`\n❌ Sharp failed on texture [${role}]: ${e.message}`);
            process.exit(1);
        }
    }

    if (!fs.existsSync('optimized-models')) {
        fs.mkdirSync('optimized-models', { recursive: true });
    }

    console.log(`\n💾 Writing to: ${outputPath}...`);
    await io.write(outputPath, document);

    console.log(`\n--- Validating Output GLB ---`);
    let validationDoc;
    try {
        validationDoc = await io.read(outputPath);
    } catch (e) {
        console.error(`❌ Validation Error: Output GLB is corrupt: ${e.message}`);
        process.exit(1);
    }

    const valRoot = validationDoc.getRoot();
    if (valRoot.listTextures().length !== 3) {
        console.error(`❌ Validation Error: Expected 3 textures, got ${valRoot.listTextures().length}`);
        process.exit(1);
    }
    if (valRoot.listMeshes().length === 0 || valRoot.listMaterials().length === 0 || valRoot.listScenes().length === 0) {
        console.error(`❌ Validation Error: Mesh, Material, or Scene missing`);
        process.exit(1);
    }

    console.log(`  [Validation] Output GLB is readable and valid.\n`);

    const oldSizeMB = (fs.statSync(inputPath).size / (1024 * 1024));
    const newSizeMB = (fs.statSync(outputPath).size / (1024 * 1024));
    const reduction = ((oldSizeMB - newSizeMB) / oldSizeMB) * 100;

    console.log(`Original GLB:`);
    console.log(`~${oldSizeMB.toFixed(2)} MB`);
    console.log(`Optimized GLB:`);
    console.log(`~${newSizeMB.toFixed(2)} MB`);
    console.log(`Reduction:`);
    console.log(`${reduction.toFixed(1)} %\n`);
    
    console.log(`Textures:`);
    report.forEach(stat => {
        const oldMB = (stat.originalBytes / 1024 / 1024).toFixed(2);
        const newMB = (stat.newBytes / 1024 / 1024).toFixed(2);
        console.log(`${stat.role}:`);
        console.log(`${stat.originalWidth}x${stat.originalHeight} -> ${stat.newWidth}x${stat.newHeight}`);
        console.log(`${oldMB} MB -> ${newMB} MB\n`);
    });
    console.log(`=========================================`);
}

run().catch(console.error);
