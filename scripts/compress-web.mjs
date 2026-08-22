import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS, KHRDracoMeshCompression } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { MeshoptSimplifier } from 'meshoptimizer';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const TARGET_MB = 3;
const MIN_TRIANGLES = 80_000;
const INPUT_DIR = 'optimized-models';
const OUTPUT_DIR = 'web-models';
const PUBLIC_DIR = path.join('public', 'web-models');

function mb(bytes) {
    return bytes / (1024 * 1024);
}

function formatMB(bytes) {
    return `${mb(bytes).toFixed(2)} MB`;
}

function countTriangles(document) {
    let tris = 0;
    let verts = 0;
    for (const mesh of document.getRoot().listMeshes()) {
        for (const prim of mesh.listPrimitives()) {
            const pos = prim.getAttribute('POSITION');
            if (pos) verts += pos.getCount();
            const indices = prim.getIndices();
            if (indices) tris += indices.getCount() / 3;
            else if (pos) tris += pos.getCount() / 3;
        }
    }
    return { tris: Math.round(tris), verts };
}

async function createIO() {
    return new NodeIO()
        .registerExtensions(KHRONOS_EXTENSIONS)
        .registerDependencies({
            'draco3d.decoder': await draco3d.createDecoderModule(),
            'draco3d.encoder': await draco3d.createEncoderModule(),
        });
}

function classifyTextures(root) {
    const baseColor = new Set();
    for (const material of root.listMaterials()) {
        const bc = material.getBaseColorTexture();
        if (bc) baseColor.add(bc);
    }
    return { baseColor };
}

async function downscaleHugeTextures(document) {
    const root = document.getRoot();
    const { baseColor } = classifyTextures(root);
    let changed = 0;

    for (const texture of root.listTextures()) {
        const image = texture.getImage();
        if (!image) continue;

        let meta;
        try {
            meta = await sharp(Buffer.from(image), { failOn: 'none' }).metadata();
        } catch {
            continue;
        }

        const maxSize = baseColor.has(texture) ? 2048 : 1024;
        if ((meta.width || 0) <= maxSize && (meta.height || 0) <= maxSize) continue;

        const out = await sharp(Buffer.from(image), { failOn: 'none' })
            .resize(maxSize, maxSize, {
                fit: 'inside',
                withoutEnlargement: true,
                kernel: 'lanczos3',
            })
            .jpeg({ quality: 86, mozjpeg: true })
            .toBuffer();

        texture.setImage(new Uint8Array(out));
        texture.setMimeType('image/jpeg');
        const uri = texture.getURI() || 'texture.jpg';
        texture.setURI(uri.replace(/\.(png|webp|jpe?g)$/i, '.jpg'));
        changed += 1;
        console.log(`  texture ${meta.width}x${meta.height} -> <=${maxSize}`);
    }

    return changed;
}

function applyDraco(document) {
    for (const ext of document.getRoot().listExtensionsUsed()) {
        if (ext.extensionName === 'KHR_draco_mesh_compression') ext.dispose();
    }

    document
        .createExtension(KHRDracoMeshCompression)
        .setRequired(true)
        .setEncoderOptions({
            method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER,
            encodeSpeed: 1,
            decodeSpeed: 5,
            quantizationBits: {
                POSITION: 14,
                NORMAL: 10,
                COLOR: 8,
                TEX_COORD: 12,
                GENERIC: 12,
            },
        });
}

function toFloat32(accessor) {
    const arr = accessor.getArray();
    if (!arr) throw new Error('Missing accessor data');
    if (arr instanceof Float32Array) return arr;

    const out = new Float32Array(arr.length);
    if (accessor.getNormalized()) {
        const max = arr instanceof Int16Array ? 32767 : arr instanceof Int8Array ? 127 : 255;
        for (let i = 0; i < arr.length; i++) out[i] = arr[i] / max;
    } else {
        out.set(arr);
    }
    return out;
}

function remapAttribute(accessor, remap, unique) {
    const src = accessor.getArray();
    const size = accessor.getElementSize();
    const Ctor = src.constructor;
    const dst = new Ctor(unique * size);
    const srcCount = accessor.getCount();

    for (let i = 0; i < srcCount; i++) {
        const next = remap[i];
        if (next === 0xffffffff) continue;
        const srcOff = i * size;
        const dstOff = next * size;
        for (let c = 0; c < size; c++) dst[dstOff + c] = src[srcOff + c];
    }

    accessor.setArray(dst);
}

function packAttributes(prim, vertCount) {
    const normal = prim.getAttribute('NORMAL');
    const uv = prim.getAttribute('TEXCOORD_0');
    const parts = [];
    const weights = [];

    if (normal) {
        parts.push(toFloat32(normal));
        weights.push(0.5, 0.5, 0.5);
    }
    if (uv) {
        parts.push(toFloat32(uv));
        weights.push(1, 1);
    }
    if (parts.length === 0) return null;

    const stride = weights.length;
    const attrs = new Float32Array(vertCount * stride);
    for (let i = 0; i < vertCount; i++) {
        let offset = 0;
        for (const part of parts) {
            const width = part.length / vertCount;
            for (let c = 0; c < width; c++) {
                attrs[i * stride + offset + c] = part[i * width + c];
            }
            offset += width;
        }
    }

    return { attrs, stride, weights };
}

function applySimplifiedIndices(prim, dstIndices, srcIndexCount, usedError, label) {
    const compact = new Uint32Array(dstIndices);
    const [remap, unique] = MeshoptSimplifier.compactMesh(compact);

    for (const semantic of prim.listSemantics()) {
        remapAttribute(prim.getAttribute(semantic), remap, unique);
    }

    const indices = prim.getIndices();
    indices.setArray(unique <= 65534 ? new Uint16Array(compact) : compact);

    console.log(
        `  ${label} ${(srcIndexCount / 3).toLocaleString()} -> ${(compact.length / 3).toLocaleString()} tris (error ${usedError.toFixed(4)})`
    );
}

async function simplifyMeshes(document, ratio, error, { sloppy = false } = {}) {
    await MeshoptSimplifier.ready;

    for (const mesh of document.getRoot().listMeshes()) {
        for (const prim of mesh.listPrimitives()) {
            const position = prim.getAttribute('POSITION');
            const indices = prim.getIndices();
            if (!position || !indices || prim.getMode() !== 4) continue;

            const positionArray = toFloat32(position);
            const indexSrc = indices.getArray();
            const indices32 = indexSrc instanceof Uint32Array ? new Uint32Array(indexSrc) : new Uint32Array(indexSrc);
            const srcIndexCount = indices32.length;
            const targetCount = Math.max(3, Math.floor((ratio * srcIndexCount) / 3) * 3);
            const vertCount = position.getCount();

            let dstIndices;
            let usedError;

            if (sloppy) {
                [dstIndices, usedError] = MeshoptSimplifier.simplifySloppy(
                    indices32,
                    positionArray,
                    3,
                    null,
                    targetCount,
                    error
                );
                applySimplifiedIndices(prim, dstIndices, srcIndexCount, usedError, 'sloppy simplify');
                continue;
            }

            const packed = packAttributes(prim, vertCount);
            if (packed) {
                [dstIndices, usedError] = MeshoptSimplifier.simplifyWithAttributes(
                    indices32,
                    positionArray,
                    3,
                    packed.attrs,
                    packed.stride,
                    packed.weights,
                    null,
                    targetCount,
                    error,
                    ['Permissive']
                );
            } else {
                [dstIndices, usedError] = MeshoptSimplifier.simplify(
                    indices32,
                    positionArray,
                    3,
                    targetCount,
                    error,
                    ['Permissive']
                );
            }

            applySimplifiedIndices(prim, dstIndices, srcIndexCount, usedError, 'simplify');
        }
    }
}

async function textureBytes(document) {
    let total = 0;
    for (const texture of document.getRoot().listTextures()) {
        const image = texture.getImage();
        if (image) total += image.byteLength;
    }
    return total;
}

function estimateRatio(meshBytes, texBytesAfter, currentTris) {
    const budgetBytes = TARGET_MB * 1024 * 1024 - texBytesAfter - 200 * 1024;
    if (budgetBytes <= 0) return 0.12;

    let ratio = (budgetBytes / Math.max(meshBytes, 1)) * 0.85;
    const minRatio = MIN_TRIANGLES / Math.max(currentTris, MIN_TRIANGLES);
    return Number(Math.min(0.9, Math.max(minRatio, ratio)).toFixed(3));
}

async function writeCompressed(io, document, outputPath) {
    applyDraco(document);
    await io.write(outputPath, document);
    return fs.statSync(outputPath).size;
}

async function compressOne(io, file) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file);
    const originalSize = fs.statSync(inputPath).size;

    console.log(`\n=========================================`);
    console.log(`Processing: ${file} (${formatMB(originalSize)})`);

    let document = await io.read(inputPath);
    const texBefore = await textureBytes(document);
    await downscaleHugeTextures(document);

    const before = countTriangles(document);
    const texAfter = await textureBytes(document);
    const meshBytes = Math.max(originalSize - texBefore, 1);
    console.log(`  mesh: ${before.verts.toLocaleString()} verts, ${before.tris.toLocaleString()} tris (~${formatMB(meshBytes)})`);
    console.log(`  textures: ${formatMB(texBefore)} -> ${formatMB(texAfter)}`);

    let ratio = estimateRatio(meshBytes, texAfter, before.tris);
    let outSize;
    let after = before;

    if (mb(originalSize) <= TARGET_MB) {
        console.log('  already under 5 MB — writing Draco copy');
        outSize = await writeCompressed(io, document, outputPath);
        after = countTriangles(await io.read(outputPath));
    } else {
        let attempt = 0;
        let currentRatio = ratio;
        let currentError = 0.002;

        while (true) {
            attempt += 1;
            const useSloppy = attempt >= 3;
            const error = useSloppy ? 0.05 : currentError;
            console.log(
                `  pass ${attempt}: keep ${(currentRatio * 100).toFixed(1)}% triangles${useSloppy ? ' (sloppy fallback)' : ''}`
            );

            document = await io.read(inputPath);
            await downscaleHugeTextures(document);
            await simplifyMeshes(document, currentRatio, error, { sloppy: useSloppy });
            after = countTriangles(document);
            outSize = await writeCompressed(io, document, outputPath);
            console.log(`  wrote ${formatMB(outSize)}`);

            if (mb(outSize) <= TARGET_MB || attempt >= 4) break;

            currentRatio = Math.max(0.08, currentRatio * 0.7);
            currentError = attempt === 1 ? 0.02 : 1;
        }
    }

    try {
        await io.read(outputPath);
    } catch (err) {
        throw new Error(`Output failed validation: ${err.message}`);
    }

    const reduction = ((originalSize - outSize) / originalSize) * 100;
    const underTarget = mb(outSize) <= TARGET_MB;
    console.log(
        `${underTarget ? 'OK' : 'OVER TARGET'}: ${file}  ${formatMB(originalSize)} -> ${formatMB(outSize)}  (${reduction.toFixed(1)}%)  ${after.tris.toLocaleString()} tris`
    );

    return {
        Model: file.replace(/\.glb$/i, ''),
        Original: formatMB(originalSize),
        Web: formatMB(outSize),
        Tris: after.tris.toLocaleString(),
        Saved: `${reduction.toFixed(1)}%`,
        Under5MB: underTarget ? 'yes' : 'NO',
    };
}

async function run() {
    if (!fs.existsSync(INPUT_DIR)) {
        console.error(`Missing ${INPUT_DIR}. Put source GLBs there first.`);
        process.exit(1);
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });

    const onlyArg = process.argv.indexOf('--only');
    let files = fs.readdirSync(INPUT_DIR).filter((f) => f.toLowerCase().endsWith('.glb'));
    if (onlyArg !== -1 && process.argv[onlyArg + 1]) {
        files = files.filter((f) => f === process.argv[onlyArg + 1]);
    }

    if (files.length === 0) {
        console.error(`No .glb files in ${INPUT_DIR}`);
        process.exit(1);
    }

    console.log(`Found ${files.length} models. Target: under ${TARGET_MB} MB each.`);
    console.log('Source files already use Draco. Extra size is 1–3.6 million triangles.');
    console.log('Triangle count is reduced only as much as needed to land under 5 MB.\n');

    const io = await createIO();
    const report = [];

    for (const file of files) {
        try {
            const row = await compressOne(io, file);
            report.push(row);
            fs.copyFileSync(path.join(OUTPUT_DIR, file), path.join(PUBLIC_DIR, file));
        } catch (err) {
            console.error(`Failed: ${file}`, err);
            report.push({
                Model: file.replace(/\.glb$/i, ''),
                Original: 'error',
                Web: 'error',
                Tris: '-',
                Saved: '-',
                Under5MB: 'NO',
            });
        }
    }

    console.log('\n\n========== WEB MODEL SIZE REPORT ==========');
    console.table(report);
    console.log(`Wrote ${OUTPUT_DIR}/ and copied into ${PUBLIC_DIR}/`);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
