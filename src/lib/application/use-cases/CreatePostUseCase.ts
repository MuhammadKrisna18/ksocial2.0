import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import { Post } from '$lib/domain/entities/Post';
import { ValidationError } from '$lib/application/exceptions';
import { randomUUID } from 'crypto';

export interface CreatePostRequest {
	userId: string;
	content: string;
	media?: { url: string; type: 'image' | 'video' }[];
}

export class CreatePostUseCase {
	constructor(private readonly postRepository: IPostRepository) {}

	async execute(request: CreatePostRequest): Promise<Post> {
		if (!request.content || request.content.trim() === '') {
			throw new ValidationError('Content cannot be empty');
		}

		return this.postRepository.create({
			id: randomUUID(),
			userId: request.userId,
			content: request.content.trim(),
			media: request.media
		});
	}
}
