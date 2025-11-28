import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";

const	publicDir	=
	path.resolve(__dirname, "..", "public");

const	fallbackFile	=
	path.join(publicDir, "index.html");

const	contentTypeMap	=
	new Map<string, string>([
		[".css", "text/css; charset=utf-8"],
		[".html", "text/html; charset=utf-8"],
		[".js", "text/javascript; charset=utf-8"],
		[".json", "application/json; charset=utf-8"],
		[".svg", "image/svg+xml"],
		[".png", "image/png"],
		[".jpg", "image/jpeg"],
		[".jpeg", "image/jpeg"],
		[".webp", "image/webp"],
		[".ico", "image/x-icon"]
	]);

const	getContentType	= (filePath: string): string => {
	const	extension	=
		path.extname(filePath).toLowerCase();

	return (
		contentTypeMap.get(extension) ??
		"application/octet-stream"
	);
};

const	streamFile	= (res: ServerResponse, filePath: string, cacheControl: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const	source	=
			createReadStream(filePath);

		res.writeHead(200, {
			"Content-Type": getContentType(filePath),
			"Cache-Control": cacheControl
		});

		source.pipe(res);
		source.on("end", () => resolve());
		source.on("error", (error) => reject(error));
	});
};

const	sendJson	= (res: ServerResponse, payload: Record<string, unknown>): void => {
	const	body	=
		JSON.stringify(payload);

	res.writeHead(200, {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-cache"
	});
	res.end(body);
};

const	resolvePublicPath	= (pathname: string): string => {
	const	safePath	=
		path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");

	return path.join(publicDir, safePath);
};

const	handleStaticRequest	= async (res: ServerResponse, pathname: string): Promise<void> => {
	const	requestPath	=
		pathname === "/" ? "/index.html" : pathname;

	let	targetPath	=
		resolvePublicPath(requestPath);

	try {
		const	fileInfo	=
			await stat(targetPath);

		if (fileInfo.isDirectory()) {
			targetPath	=
				path.join(targetPath, "index.html");
		}
	} catch {
		targetPath	=
			fallbackFile;
	}

	const	cacheControl	=
		targetPath.endsWith(".html") ? "no-cache" : "public, max-age=86400";

	await streamFile(res, targetPath, cacheControl);
};

const	handleRequest	= async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
	const	requestUrl	=
		new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

	if (requestUrl.pathname === "/health") {
		sendJson(res, { status: "ok" });
		return;
	}

	try {
		await handleStaticRequest(res, requestUrl.pathname);
	} catch (error) {
		console.error("Static serve error:", error);
		res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("Internal Server Error");
	}
};

const	server	=
	createServer((req, res) => {
		void handleRequest(req, res);
	});

const	port	=
	Number(process.env.PORT ?? 4000);

server.listen(port, () => {
	console.log(`Transcendance Node frontend ready on http://localhost:${port}`);
});

