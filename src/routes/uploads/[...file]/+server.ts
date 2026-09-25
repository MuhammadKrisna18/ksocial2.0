import type { RequestHandler } from './$types';
import fs from 'fs';
import path from 'path';
import os from 'os';

const MIME_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.mov': 'video/quicktime'
};

export const GET: RequestHandler = async ({ params }) => {
	const relativePath = params.file;
	if (!relativePath || relativePath.includes('..')) {
		return new Response('Not found', { status: 404 });
	}

	// Look in process.cwd()/static/uploads and os.tmpdir()/static/uploads
	const candidatePaths = [
		path.join(process.cwd(), 'static', 'uploads', relativePath),
		path.join(os.tmpdir(), 'static', 'uploads', relativePath)
	];

	for (const candidate of candidatePaths) {
		try {
			if (fs.existsSync(candidate)) {
				const stat = await fs.promises.stat(candidate);
				if (stat.isFile()) {
					const data = await fs.promises.readFile(candidate);
					const ext = path.extname(candidate).toLowerCase();
					const contentType = MIME_TYPES[ext] || 'application/octet-stream';
					return new Response(data, {
						headers: {
							'Content-Type': contentType,
							'Content-Length': stat.size.toString(),
							'Cache-Control': 'public, max-age=86400'
						}
					});
				}
			}
		} catch {
			// ignore and continue to next candidate
		}
	}

	return new Response('File not found', { status: 404 });
};
