export type MemoryZoneTheme = 'laughter' | 'adventure' | 'food' | 'memories' | 'caveGuide' | 'garden';

export interface MemoryZone {
  itemId: string;
  label: string;
  theme: MemoryZoneTheme;
  x: number;
  y: number;
  width: number;
  height: number;
  primaryColor: number;
  secondaryColor: number;
}

export const memoryZones: MemoryZone[] = [];
