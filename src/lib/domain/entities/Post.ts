export interface PostProps {
	id: string;
	authorId: string;
	content: string;
	likesCount?: number;
	commentsCount?: number;
	sharesCount?: number;
	media?: { url: string; type: 'image' | 'video' }[];
	createdAt?: Date;
	updatedAt?: Date;
}

export class Post {
	private constructor(private readonly props: PostProps) {
		this.props.likesCount = this.props.likesCount ?? 0;
		this.props.commentsCount = this.props.commentsCount ?? 0;
		this.props.sharesCount = this.props.sharesCount ?? 0;
		this.props.createdAt = this.props.createdAt ?? new Date();
		this.props.updatedAt = this.props.updatedAt ?? new Date();
	}

	static create(props: PostProps): Post {
		return new Post({ ...props });
	}

	get id(): string {
		return this.props.id;
	}

	get authorId(): string {
		return this.props.authorId;
	}

	get content(): string {
		return this.props.content;
	}

	get likesCount(): number {
		return this.props.likesCount ?? 0;
	}

	get commentsCount(): number {
		return this.props.commentsCount ?? 0;
	}

	get sharesCount(): number {
		return this.props.sharesCount ?? 0;
	}

	get media(): { url: string; type: 'image' | 'video' }[] | undefined {
		return this.props.media;
	}

	get createdAt(): Date {
		return this.props.createdAt ?? new Date();
	}

	get updatedAt(): Date {
		return this.props.updatedAt ?? new Date();
	}

	incrementLikes(): void {
		this.props.likesCount = (this.props.likesCount ?? 0) + 1;
		this.props.updatedAt = new Date();
	}

	decrementLikes(): void {
		this.props.likesCount = Math.max(0, (this.props.likesCount ?? 0) - 1);
		this.props.updatedAt = new Date();
	}

	incrementComments(): void {
		this.props.commentsCount = (this.props.commentsCount ?? 0) + 1;
		this.props.updatedAt = new Date();
	}

	decrementComments(): void {
		this.props.commentsCount = Math.max(0, (this.props.commentsCount ?? 0) - 1);
		this.props.updatedAt = new Date();
	}

	incrementShares(): void {
		this.props.sharesCount = (this.props.sharesCount ?? 0) + 1;
		this.props.updatedAt = new Date();
	}

	toJSON() {
		return {
			id: this.id,
			authorId: this.authorId,
			content: this.content,
			likesCount: this.likesCount,
			commentsCount: this.commentsCount,
			sharesCount: this.sharesCount,
			media: this.media,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt
		};
	}
}
