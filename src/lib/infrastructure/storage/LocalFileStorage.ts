import fs from 'fs';
import path from 'path';

export class LocalFileStorage {
	private readonly uploadDir: string;
	private readonly publicUrlPrefix: string;

	constructor(baseDir: string = 'static/uploads/users', publicUrlPrefix: string = '/uploads/users') {
		this.publicUrlPrefix = publicUrlPrefix;
		this.uploadDir = path.resolve(process.cwd(), baseDir);
		if (!fs.existsSync(this.uploadDir)) {
			fs.mkdirSync(this.uploadDir, { recursive: true });
		}
	}

	async saveFile(file: File, filename: string): Promise<string> {
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
		if (fs.existsSync(filePath)) {
			await fs.promises.unlink(filePath);
		}
	}
}

export const localFileStorage = new LocalFileStorage();
export const postFileStorage = new LocalFileStorage('static/uploads/posts', '/uploads/posts');
