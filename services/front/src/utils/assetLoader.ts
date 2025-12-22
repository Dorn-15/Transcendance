const assetsCache: Record<string, string> = {};

export const preloadAsset = async (fileName: string) => {
    if (assetsCache[fileName]) return;

    try {
        const path = `/assets/glbFile/${fileName}`;
        const response = await fetch(path);
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            throw new Error(`Le fichier n'existe pas (reçu du HTML au lieu du binaire) : ${path}`);
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        assetsCache[fileName] = objectUrl;
        
    } catch (error) {
      
    }
};

export const getAssetUrl = (fileName: string, basePath: string) => {
    if (assetsCache[fileName]) {
        return { root: "", file: assetsCache[fileName] };
    }
    return { root: basePath, file: fileName };
};

