import fs from 'fs';
import path from 'path';
import os from 'os';

export class LocalFileStorage {
	private readonly uploadDir: string;
	private readonly publicUrlPrefix: string;

	constructor(baseDir: string = 'static/uploads/users', publicUrlPrefix: string = '/uploads/users') {
		this.publicUrlPrefix = publicUrlPrefix;
		// In serverless environments (Vercel / AWS Lambda), the root filesystem is read-only.
		if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
			this.uploadDir = path.join(os.tmpdir(), baseDir);
		} else {
			this.uploadDir = path.resolve(process.cwd(), baseDir);
		}
	}

	private ensureDir(): void {
		try {
			if (!fs.existsSync(this.uploadDir)) {
				fs.mkdirSync(this.uploadDir, { recursive: true });
			}
		} catch (err) {
			console.warn(`Could not create directory ${this.uploadDir}:`, err);
		}
	}

	async saveFile(file: File, filename: string): Promise<string> {
		this.ensureDir();
		const buffer = Buffer.from(await file.arrayBuffer());
		const filePath = path.join(this.uploadDir, filename);
		
		await fs.promises.writeFile(filePath, buffer);
		
		// Return the public URL path
		return `${this.publicUrlPrefix}/${filename}`;
	}

	async deleteFileByUrl(url: string): Promise<void> {
		// Example url: /uploads/users/filename.jpg
		const filename = path.basename(url);
		const filePath = path.join(this.uploadDir, filename);
		try {
			if (fs.existsSync(filePath)) {
				await fs.promises.unlink(filePath);
			}
		} catch (err) {
			console.warn(`Could not delete file ${filePath}:`, err);
		}
	}
}

export const localFileStorage = new LocalFileStorage();
export const postFileStorage = new LocalFileStorage('static/uploads/posts', '/uploads/posts');
