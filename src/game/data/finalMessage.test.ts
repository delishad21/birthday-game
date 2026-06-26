import { describe, expect, it } from 'vitest';
import { finalMessage } from './finalMessage';

describe('final message data', () => {
  it('does not contain birthday sky cutscene copy', () => {
    expect(finalMessage.finalTitle).toBe('The End');
    expect(finalMessage.finalMessageLines).toEqual([]);
    expect(finalMessage.closingLine).toBe('');
  });
});
