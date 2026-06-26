const { createReadStream } = require('node:fs');
const { stat } = require('node:fs/promises');
const path = require('node:path');
const { Readable } = require('node:stream');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.ogg': 'video/ogg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
};

const getMimeType = (filePath) => mimeTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';

const resolveDistFilePath = (requestUrl, distPath) => {
  const url = new URL(requestUrl);
  const requestedPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.resolve(distPath, `.${requestedPath}`);
  const distRoot = path.resolve(distPath);

  return filePath.startsWith(`${distRoot}${path.sep}`) || filePath === distRoot ? filePath : undefined;
};

const parseRangeHeader = (rangeHeader, fileSize) => {
  const match = rangeHeader?.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) {
    return undefined;
  }

  const [, startText, endText] = match;
  const start = startText ? Number(startText) : Math.max(0, fileSize - Number(endText));
  const end = endText ? Number(endText) : fileSize - 1;

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= fileSize) {
    return undefined;
  }

  return { start, end: Math.min(end, fileSize - 1) };
};

const streamFileResponse = (filePath, { start = 0, end, status = 200, headers }) => {
  const stream = createReadStream(filePath, { start, end });
  return new Response(Readable.toWeb(stream), { status, headers });
};

const createAppProtocolResponse = async (request, distPath) => {
  const filePath = resolveDistFilePath(request.url, distPath);
  if (!filePath) {
    return new Response('Forbidden', { status: 403 });
  }

  let fileStats;
  try {
    fileStats = await stat(filePath);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  if (!fileStats.isFile()) {
    return new Response('Not found', { status: 404 });
  }

  const fileSize = fileStats.size;
  const contentType = getMimeType(filePath);
  const range = parseRangeHeader(request.headers.get('range'), fileSize);

  if (range) {
    const contentLength = range.end - range.start + 1;
    return streamFileResponse(filePath, {
      start: range.start,
      end: range.end,
      status: 206,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': String(contentLength),
        'Content-Range': `bytes ${range.start}-${range.end}/${fileSize}`,
        'Content-Type': contentType,
      },
    });
  }

  return streamFileResponse(filePath, {
    end: fileSize - 1,
    headers: {
      'Accept-Ranges': 'bytes',
      'Content-Length': String(fileSize),
      'Content-Type': contentType,
    },
  });
};

module.exports = { createAppProtocolResponse, getMimeType, parseRangeHeader, resolveDistFilePath };
