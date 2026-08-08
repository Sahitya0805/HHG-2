export type GeneratorFormat = 'id_card' | 'pfp_frame';

export type CardTheme = 'emerald' | 'sunset' | 'cyber' | 'retro';

export type FramePreset = 'classic_palm' | 'neon_sunset' | 'hacker_stamp' | 'badge_gold';

export interface ImageAdjustment {
  zoom: number; // 0.5 to 3
  offsetX: number; // -200 to 200
  offsetY: number; // -200 to 200
  rotation: number; // -180 to 180
}

export interface BuilderDetails {
  name: string;
  role: string;
  title: string;
  theme: CardTheme;
  framePreset: FramePreset;
}

export interface PhotoData {
  file: File | null;
  previewUrl: string | null;
  imageElement: HTMLImageElement | null;
  width: number;
  height: number;
  isHeic: boolean;
}
