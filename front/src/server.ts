import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On remonte d'un niveau depuis /dist pour trouver /public
const publicDir = path.resolve(__dirname, "..", "public");
const distDir = __dirname;

const contentTypeMap = new Map<string, string>([
    [".css", "text/css; charset=utf-8"],
    [".html", "text/html; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".glb", "model/gltf-binary"],
    [".gltf", "model/gltf+json"]
]);

const getContentType = (filePath: string) => 
    contentTypeMap.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream";

const streamFile = (res: ServerResponse, filePath: string, cacheControl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const source = createReadStream(filePath);
        res.writeHead(200, {
            "Content-Type": getContentType(filePath),
            "Cache-Control": cacheControl
        });
        source.pipe(res);
        source.on("end", () => resolve());
        source.on("error", (error) => reject(error));
    });
};

const handleRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    const pathname = url.pathname;

    // 1. Nettoyage du chemin (enlève le slash initial pour path.join)
    // Ex: "/vendor/babylon.js" devient "vendor/babylon.js"
    const relativePath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

    let targetPath = "";
    let isStaticAsset = false;

    // 2. Logique de routage
    if (pathname.startsWith("/vendor/") || pathname.startsWith("/assets/")) {
        // Les libs et les assets sont dans PUBLIC
        targetPath = path.join(publicDir, relativePath);
        isStaticAsset = true;
    } else if (pathname.endsWith(".js")) {
        // Le code de l'app (main.js, components...) est dans DIST
        targetPath = path.join(distDir, relativePath);
        isStaticAsset = true;
    } else {
        // HTML ou racine -> index.html dans PUBLIC
        targetPath = path.join(publicDir, relativePath === "" ? "index.html" : relativePath);
    }

    // 3. Tentative de lecture
    try {
        await stat(targetPath);
        // Si ça passe, on sert le fichier
        const cache = "no-store, no-cache, must-revalidate, proxy-revalidate";
        await streamFile(res, targetPath, cache);
    } catch (err) {
        // Si fichier non trouvé
        if (isStaticAsset) {
            console.error(`[404] Fichier introuvable : ${targetPath}`);
            res.writeHead(404);
            res.end("Not Found");
        } else {
            // Si c'est une URL de navigation (ex: /profile), on renvoie index.html (SPA)
            await streamFile(res, path.join(publicDir, "index.html"), "no-cache");
        }
    }
};

createServer((req, res) => void handleRequest(req, res))
    .listen(4000, () => {
        console.log(`Server running on http://localhost:4000`);
        console.log(`Public: ${publicDir}`);
        console.log(`Dist:   ${distDir}`);
    });