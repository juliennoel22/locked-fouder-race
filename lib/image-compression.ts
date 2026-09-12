export interface CompressedImage {
  file: File;
  base64: string;
  previewUrl: string;
  sizeKb: number;
  originalSizeKb: number;
  mimeType?: string;
  isPdf?: boolean;
}

/**
 * Compression Canvas HTML5 côté client pour les images,
 * ou lecture directe Base64 pour les documents PDF.
 */
export async function compressCourseImage(
  inputFile: File,
  maxDimension: number = 1600,
  quality: number = 0.8
): Promise<CompressedImage> {
  const originalSizeKb = Math.round(inputFile.size / 1024);

  // Prise en charge native des fichiers PDF
  if (
    inputFile.type === "application/pdf" ||
    inputFile.name.toLowerCase().endsWith(".pdf")
  ) {
    const previewUrl = URL.createObjectURL(inputFile);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(inputFile);
      reader.onload = (event) => {
        const base64 = (event.target?.result as string) || "";
        resolve({
          file: inputFile,
          base64,
          previewUrl,
          sizeKb: originalSizeKb,
          originalSizeKb,
          mimeType: "application/pdf",
          isPdf: true,
        });
      };
      reader.onerror = () =>
        reject(new Error("Erreur de lecture du document PDF"));
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(inputFile);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcul du redimensionnement homothétique
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Impossible d'initialiser le contexte Canvas 2D"));
          return;
        }

        // Amélioration du rendu pour le texte manuscrit
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL("image/jpeg", quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Erreur lors de la compression de l'image"));
              return;
            }

            const compressedFile = new File([blob], inputFile.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            const sizeKb = Math.round(blob.size / 1024);
            const previewUrl = URL.createObjectURL(blob);

            resolve({
              file: compressedFile,
              base64,
              previewUrl,
              sizeKb,
              originalSizeKb,
            });
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Impossible de charger l'image source"));
    };

    reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
  });
}
