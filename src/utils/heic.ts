import heic2any from 'heic2any';

export interface LoadedPhoto {
  file: File;
  previewUrl: string;
  imageElement: HTMLImageElement;
}

export async function loadPhotoFile(file: File): Promise<LoadedPhoto> {
  const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type.includes('heic');
  let blob: Blob = file;

  if (isHeic) {
    try {
      const converted = await heic2any({ blob: file, toType: 'image/png' });
      blob = Array.isArray(converted) ? converted[0] : converted;
    } catch (e) {
      console.warn('HEIC fallback error:', e);
    }
  }

  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ file, previewUrl: objectUrl, imageElement: img });
    img.onerror = () => reject(new Error('Invalid image file. Please upload JPG, PNG, or HEIC.'));
    img.src = objectUrl;
  });
}
