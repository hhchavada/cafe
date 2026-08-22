import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const inputDir = process.argv[2] || 'optimized-models';

const io = new NodeIO()
    .registerExtensions(KHRONOS_EXTENSIONS)
    .registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
        'draco3d.encoder': await draco3d.createEncoderModule(),
    });

const files = fs.readdirSync(inputDir).filter((f) => f.toLowerCase().endsWith('.glb'));

for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const document = await io.read(inputPath);
    const root = document.getRoot();
    const fileMB = fs.statSync(inputPath).size / (1024 * 1024);

    let meshBytes = 0;
    let verts = 0;
    let tris = 0;
    for (const accessor of root.listAccessors()) {
        meshBytes += accessor.getArray()?.byteLength || 0;
    }
    for (const mesh of root.listMeshes()) {
        for (const prim of mesh.listPrimitives()) {
            const pos = prim.getAttribute('POSITION');
            if (pos) verts += pos.getCount();
            const indices = prim.getIndices();
            if (indices) tris += indices.getCount() / 3;
        }
    }

    const textures = [];
    for (const texture of root.listTextures()) {
        const image = texture.getImage();
        if (!image) continue;
        let w = '?';
        let h = '?';
        try {
            const meta = await sharp(Buffer.from(image)).metadata();
            w = meta.width;
            h = meta.height;
        } catch {
            // ignore
        }
        textures.push({
            mime: texture.getMimeType(),
            mb: +(image.byteLength / (1024 * 1024)).toFixed(2),
            size: `${w}x${h}`,
        });
    }

    const texMB = textures.reduce((s, t) => s + t.mb, 0);
    console.log(`\n=== ${file} (${fileMB.toFixed(2)} MB) ===`);
    console.log(`meshes=${root.listMeshes().length} verts=${verts.toLocaleString()} tris=${Math.round(tris).toLocaleString()} accessors=${(meshBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`textures=${textures.length} total=${texMB.toFixed(2)} MB`);
    textures.forEach((t, i) => console.log(`  [${i}] ${t.mime} ${t.size} ${t.mb} MB`));
}
