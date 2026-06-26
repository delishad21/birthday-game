import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { createAppProtocolResponse } = require('./appProtocol.cjs') as {
  createAppProtocolResponse: (request: Request, distPath: string) => Promise<Response>;
};

describe('createAppProtocolResponse', () => {
  it('serves video range requests with partial content headers', async () => {
    const distPath = mkdtempSync(path.join(tmpdir(), 'birthday-app-protocol-'));
    writeFileSync(path.join(distPath, 'clip.mp4'), Buffer.from('0123456789'));

    const response = await createAppProtocolResponse(new Request('app://birthday/clip.mp4', {
      headers: { Range: 'bytes=2-5' },
    }), distPath);

    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Type')).toBe('video/mp4');
    expect(response.headers.get('Accept-Ranges')).toBe('bytes');
    expect(response.headers.get('Content-Range')).toBe('bytes 2-5/10');
    expect(response.headers.get('Content-Length')).toBe('4');
    await expect(response.text()).resolves.toBe('2345');
  });

  it('rejects requests that escape the packaged dist directory', async () => {
    const distPath = mkdtempSync(path.join(tmpdir(), 'birthday-app-protocol-'));

    const response = await createAppProtocolResponse(new Request('app://birthday/..%2Fsecret.txt'), distPath);

    expect(response.status).toBe(403);
  });
});
