export interface PostProps {
	id: string;
	authorId: string;
	authorName: string;
	authorUsername: string;
	content: string;
	likesCount: number;
	commentsCount: number;
	sharesCount: number;
	media?: { url: string; type: 'image' | 'video' }[];
	isSaved?: boolean;
	isLiked?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export class Post {
	private constructor(private readonly props: PostProps) {}

	static create(props: PostProps): Post {
		return new Post(props);
	}

	get id(): string {
		return this.props.id;
	}

	get authorId(): string {
		return this.props.authorId;
	}

	get authorName(): string {
		return this.props.authorName;
	}

	get authorUsername(): string {
		return this.props.authorUsername;
	}

	get content(): string {
		return this.props.content;
	}

	get likesCount(): number {
		return this.props.likesCount;
	}

	get commentsCount(): number {
		return this.props.commentsCount;
	}

	get sharesCount(): number {
		return this.props.sharesCount;
	}

	get media(): { url: string; type: 'image' | 'video' }[] | undefined {
		return this.props.media;
	}

	get isSaved(): boolean {
		return this.props.isSaved ?? false;
	}

	get isLiked(): boolean {
		return this.props.isLiked ?? false;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	toJSON() {
		return {
			id: this.id,
			authorId: this.authorId,
			authorName: this.authorName,
			authorUsername: this.authorUsername,
			content: this.content,
			likesCount: this.likesCount,
			commentsCount: this.commentsCount,
			sharesCount: this.sharesCount,
			media: this.media,
			isSaved: this.isSaved,
			isLiked: this.isLiked,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt
		};
	}
}
