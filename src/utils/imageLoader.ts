import heic2any from 'heic2any';
import { PhotoData } from '../types';

export async function processUploadedFile(file: File): Promise<PhotoData> {
  const fileName = file.name.toLowerCase();
  const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif') || file.type.includes('heic') || file.type.includes('heif');

  let processedBlob: Blob = file;

  if (isHeic) {
    try {
      const converted = await heic2any({
        blob: file,
        toType: 'image/png',
        quality: 0.9,
      });
      processedBlob = Array.isArray(converted) ? converted[0] : converted;
    } catch (err) {
      console.warn('HEIC conversion warning, fallback to direct object URL:', err);
    }
  }

  const objectUrl = URL.createObjectURL(processedBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      resolve({
        file,
        previewUrl: objectUrl,
        imageElement: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        isHeic,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Please upload a valid JPG, PNG, or HEIC image.'));
    };

    img.src = objectUrl;
  });
}
