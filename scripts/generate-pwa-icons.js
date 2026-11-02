const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  const body = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crcBuf]);
}

function createPng(width, height, drawFn) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // no interlace

  const ihdrChunk = makeChunk("IHDR", ihdr);

  const raw = Buffer.alloc(height * (1 + width * 4));
  let pos = 0;
  for (let y = 0; y < height; y++) {
    raw[pos++] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      raw[pos++] = r;
      raw[pos++] = g;
      raw[pos++] = b;
      raw[pos++] = a;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = makeChunk("IDAT", compressed);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Letter bitmap 5x7 font for "C" and "H"
const FONT = {
  C: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  H: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
};

function renderIcon(x, y, size, isMaskable = false) {
  // Background
  const bgR = 10,
    bgG = 13,
    bgB = 18; // #0A0D12
  const blueR = 49,
    blueG = 120,
    blueB = 198; // #3178C6
  const whiteR = 241,
    whiteG = 245,
    whiteB = 249; // #F1F5F9

  if (isMaskable) {
    // Solid background for entire maskable area
    // Center card
    const pad = Math.floor(size * 0.18);
    const boxSize = size - pad * 2;
    if (x >= pad && x < size - pad && y >= pad && y < size - pad) {
      // Inside blue rounded box
      const innerX = x - pad;
      const innerY = y - pad;
      return checkText(innerX, innerY, boxSize)
        ? [whiteR, whiteG, whiteB, 255]
        : [blueR, blueG, blueB, 255];
    }
    return [bgR, bgG, bgB, 255];
  } else {
    // Normal icon with rounded blue square
    const radius = Math.floor(size * 0.12);
    const pad = Math.floor(size * 0.08);
    const boxSize = size - pad * 2;

    if (x >= pad && x < size - pad && y >= pad && y < size - pad) {
      const rx = x - pad;
      const ry = y - pad;
      // Check rounded corner
      const inCorner =
        (rx < radius &&
          ry < radius &&
          (rx - radius) ** 2 + (ry - radius) ** 2 > radius ** 2) ||
        (rx >= boxSize - radius &&
          ry < radius &&
          (rx - (boxSize - radius)) ** 2 + (ry - radius) ** 2 > radius ** 2) ||
        (rx < radius &&
          ry >= boxSize - radius &&
          (rx - radius) ** 2 + (ry - (boxSize - radius)) ** 2 > radius ** 2) ||
        (rx >= boxSize - radius &&
          ry >= boxSize - radius &&
          (rx - (boxSize - radius)) ** 2 + (ry - (boxSize - radius)) ** 2 >
            radius ** 2);

      if (inCorner) {
        return [0, 0, 0, 0];
      }

      return checkText(rx, ry, boxSize)
        ? [whiteR, whiteG, whiteB, 255]
        : [blueR, blueG, blueB, 255];
    }
    return [0, 0, 0, 0];
  }

  function checkText(rx, ry, boxSize) {
    // Scale 5x7 font to center of boxSize
    const pixelScale = Math.floor(boxSize / 15);
    const charWidth = 5 * pixelScale;
    const charHeight = 7 * pixelScale;
    const spacing = Math.floor(pixelScale * 1.5);
    const totalWidth = charWidth * 2 + spacing;

    const startX = Math.floor((boxSize - totalWidth) / 2);
    const startY = Math.floor((boxSize - charHeight) / 2);

    // Check "C"
    if (
      rx >= startX &&
      rx < startX + charWidth &&
      ry >= startY &&
      ry < startY + charHeight
    ) {
      const col = Math.floor((rx - startX) / pixelScale);
      const row = Math.floor((ry - startY) / pixelScale);
      if (FONT.C[row] && FONT.C[row][col]) return true;
    }

    // Check "H"
    const startHX = startX + charWidth + spacing;
    if (
      rx >= startHX &&
      rx < startHX + charWidth &&
      ry >= startY &&
      ry < startY + charHeight
    ) {
      const col = Math.floor((rx - startHX) / pixelScale);
      const row = Math.floor((ry - startY) / pixelScale);
      if (FONT.H[row] && FONT.H[row][col]) return true;
    }

    return false;
  }
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, "icon-192x192.png"),
  createPng(192, 192, (x, y, s) => renderIcon(x, y, s, false))
);
fs.writeFileSync(
  path.join(outDir, "icon-512x512.png"),
  createPng(512, 512, (x, y, s) => renderIcon(x, y, s, false))
);
fs.writeFileSync(
  path.join(outDir, "icon-maskable-512x512.png"),
  createPng(512, 512, (x, y, s) => renderIcon(x, y, s, true))
);
fs.writeFileSync(
  path.join(outDir, "apple-touch-icon.png"),
  createPng(180, 180, (x, y, s) => renderIcon(x, y, s, false))
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="48" fill="#3178C6"/>
  <text x="256" y="325" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="220" fill="#F1F5F9" text-anchor="middle" letter-spacing="-8">CH</text>
</svg>`;
fs.writeFileSync(path.join(outDir, "icon.svg"), svg);

console.log("PWA icons generated successfully.");
