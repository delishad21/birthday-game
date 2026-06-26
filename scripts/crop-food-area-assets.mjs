import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { inflateSync } from 'node:zlib';

const sourceDir = path.resolve('public/food-area/Food');
const outputDir = path.resolve('public/food-area/food-cropped');
const alphaThreshold = 16;
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

fs.mkdirSync(outputDir, { recursive: true });

const paethPredictor = (left, up, upperLeft) => {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);

  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  if (upDistance <= upperLeftDistance) return up;
  return upperLeft;
};

const parseRgbaPng = (filePath) => {
  const file = fs.readFileSync(filePath);
  if (!file.subarray(0, pngSignature.length).equals(pngSignature)) {
    throw new Error(`${filePath} is not a PNG file`);
  }

  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const compressedChunks = [];

  for (let offset = pngSignature.length; offset < file.length;) {
    const length = file.readUInt32BE(offset);
    const type = file.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const data = file.subarray(dataStart, dataEnd);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      compressedChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }

    offset = dataEnd + 4;
  }

  if (bitDepth !== 8 || colorType !== 6) {
    throw new Error(`${filePath} must be an 8-bit RGBA PNG; got bitDepth=${bitDepth}, colorType=${colorType}`);
  }

  const bytesPerPixel = 4;
  const rowLength = width * bytesPerPixel;
  const inflated = inflateSync(Buffer.concat(compressedChunks));
  const pixels = Buffer.alloc(width * height * bytesPerPixel);

  let inputOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset];
    inputOffset += 1;
    const rowStart = y * rowLength;
    const previousRowStart = rowStart - rowLength;

    for (let x = 0; x < rowLength; x += 1) {
      const raw = inflated[inputOffset];
      inputOffset += 1;

      const left = x >= bytesPerPixel ? pixels[rowStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? pixels[previousRowStart + x] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? pixels[previousRowStart + x - bytesPerPixel] : 0;

      switch (filter) {
        case 0:
          pixels[rowStart + x] = raw;
          break;
        case 1:
          pixels[rowStart + x] = (raw + left) & 0xff;
          break;
        case 2:
          pixels[rowStart + x] = (raw + up) & 0xff;
          break;
        case 3:
          pixels[rowStart + x] = (raw + Math.floor((left + up) / 2)) & 0xff;
          break;
        case 4:
          pixels[rowStart + x] = (raw + paethPredictor(left, up, upperLeft)) & 0xff;
          break;
        default:
          throw new Error(`${filePath} has unsupported PNG filter ${filter}`);
      }
    }
  }

  return { width, height, pixels };
};

const findAlphaBounds = ({ width, height, pixels }) => {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] > alphaThreshold) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return maxX < minX || maxY < minY ? undefined : { minX, minY, maxX, maxY };
};

for (const file of fs.readdirSync(sourceDir).filter((name) => name.endsWith('.png')).sort()) {
  const sourcePath = path.join(sourceDir, file);
  const outputPath = path.join(outputDir, file);
  const image = parseRgbaPng(sourcePath);
  const bounds = findAlphaBounds(image);

  if (!bounds) continue;

  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;

  execFileSync('sips', [
    '--cropToHeightWidth', String(height), String(width),
    '--cropOffset', String(bounds.minY), String(bounds.minX),
    sourcePath,
    '--out', outputPath,
  ], { stdio: 'ignore' });

  console.log(`${file}: ${image.width}x${image.height} -> ${width}x${height}`);
}
