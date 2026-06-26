import { describe, expect, it } from 'vitest';
import { memoryZones } from './mapDecor';

describe('map decoration data', () => {
  it('does not draw a labeled rectangle for the custom Memories area', () => {
    expect(memoryZones.some((zone) => zone.itemId === 'star-memories')).toBe(false);
  });

  it('does not draw a labeled rectangle for the custom Adventure area', () => {
    expect(memoryZones.some((zone) => zone.itemId === 'star-adventure')).toBe(false);
  });

  it('does not draw a labeled rectangle for the custom food area', () => {
    expect(memoryZones.some((zone) => zone.itemId === 'star-food')).toBe(false);
  });

  it('does not draw a labeled rectangle for Garden', () => {
    expect(memoryZones.some((zone) => zone.itemId === 'toy-marshmallow')).toBe(false);
  });

  it('keeps any remaining zones editable with a label, position, and theme', () => {
    expect(memoryZones.every((zone) => zone.label && zone.theme && zone.x > 0 && zone.y > 0)).toBe(true);
  });
});
