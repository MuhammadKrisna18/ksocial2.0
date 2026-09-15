import type { IPostRepository } from '$lib/domain/repositories/IPostRepository';
import type { Post } from '$lib/domain/entities/Post';
import { randomUUID } from 'crypto';

export interface CreatePostRequest {
	userId: string;
	content: string;
}

export class CreatePostUseCase {
	constructor(private readonly postRepository: IPostRepository) {}

	async execute(request: CreatePostRequest): Promise<Post> {
		if (!request.content || request.content.trim() === '') {
			throw new Error('Content cannot be empty');
		}

		return this.postRepository.create({
			id: randomUUID(),
			userId: request.userId,
			content: request.content.trim()
		});
	}
}
