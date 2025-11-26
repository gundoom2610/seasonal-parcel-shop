// src/utils/imageCompression.ts

export const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // 1. Create a FileReader to read the uploaded file
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // 2. Create a canvas to draw the resized image
        const canvas = document.createElement('canvas');
        
        // TARGET WIDTH: 800px 
        // (Good balance: looks sharp on mobile/desktop, but small file size)
        const maxWidth = 800; 
        
        // Calculate new dimensions keeping aspect ratio
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (img.width > maxWidth) {
          const scaleFactor = maxWidth / img.width;
          newWidth = maxWidth;
          newHeight = img.height * scaleFactor;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // 3. Draw image on canvas
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // 4. Export as WebP at 80% quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/webp', 
          0.80 // Quality (0 to 1)
        );
      };
      
      img.onerror = (err) => reject(err);
    };
    
    reader.onerror = (err) => reject(err);
  });
};