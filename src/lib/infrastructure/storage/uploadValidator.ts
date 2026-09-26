export interface ValidatedFileResult {
	isValid: boolean;
	error?: string;
	safeExtension?: string;
	mimeType?: string;
}

const ALLOWED_IMAGE_MIME_TYPES = new Map<string, string>([
	['image/jpeg', 'jpg'],
	['image/png', 'png'],
	['image/webp', 'webp']
]);

const ALLOWED_POST_MEDIA_MIME_TYPES = new Map<string, { ext: string; type: 'image' | 'video' }>([
	['image/jpeg', { ext: 'jpg', type: 'image' }],
	['image/png', { ext: 'png', type: 'image' }],
	['image/webp', { ext: 'webp', type: 'image' }],
	['video/mp4', { ext: 'mp4', type: 'video' }],
	['video/webm', { ext: 'webm', type: 'video' }],
	['video/quicktime', { ext: 'mov', type: 'video' }]
]);

export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB for profile/cover photos
export const MAX_MEDIA_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB for post attachments

/**
 * Validates uploaded avatar / cover photo.
 * Rejects non-images (like SVG, HTML, scripts) to prevent Stored XSS.
 */
export function validateImageFile(file: File, maxSizeBytes = MAX_PHOTO_SIZE_BYTES): ValidatedFileResult {
	if (!file || file.size === 0) {
		return { isValid: false, error: 'File not found or empty.' };
	}

	if (file.size > maxSizeBytes) {
		const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
		return { isValid: false, error: `File size exceeds the maximum limit (${maxMb}MB).` };
	}

	const safeExt = ALLOWED_IMAGE_MIME_TYPES.get(file.type.toLowerCase());
	if (!safeExt) {
		return {
			isValid: false,
			error: 'Unsupported file format. Only JPEG, PNG, and WebP are allowed.'
		};
	}

	return { isValid: true, safeExtension: safeExt, mimeType: file.type };
}

/**
 * Validates uploaded post media (image or video).
 */
export function validatePostMediaFile(
	file: File,
	maxSizeBytes = MAX_MEDIA_SIZE_BYTES
): ValidatedFileResult & { mediaType?: 'image' | 'video' } {
	if (!file || file.size === 0) {
		return { isValid: false, error: 'File not found or empty.' };
	}

	if (file.size > maxSizeBytes) {
		const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
		return { isValid: false, error: `Media file size exceeds the maximum limit (${maxMb}MB).` };
	}

	const match = ALLOWED_POST_MEDIA_MIME_TYPES.get(file.type.toLowerCase());
	if (!match) {
		return {
			isValid: false,
			error: 'Unsupported media format. Only JPG, PNG, WebP, MP4, and WebM are allowed.'
		};
	}

	return { isValid: true, safeExtension: match.ext, mediaType: match.type, mimeType: file.type };
}
