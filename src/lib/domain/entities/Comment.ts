export interface CommentProps {
	id: string;
	userId: string;
	postId: string;
	content: string;
	createdAt: Date;
	// Optional properties for displaying comments with author info
	authorName?: string;
	authorUsername?: string;
	authorProfilePicture?: string | null;
	parentId?: string | null;
	likesCount?: number;
	isLiked?: boolean;
	isSaved?: boolean;
	repliesCount?: number;
	replies?: Comment[];
}

export class Comment {
	private constructor(private readonly props: CommentProps) {}

	static create(props: CommentProps): Comment {
		return new Comment(props);
	}

	get id(): string {
		return this.props.id;
	}

	get userId(): string {
		return this.props.userId;
	}

	get postId(): string {
		return this.props.postId;
	}

	get content(): string {
		return this.props.content;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get authorName(): string | undefined {
		return this.props.authorName;
	}

	get authorUsername(): string | undefined {
		return this.props.authorUsername;
	}

	get authorProfilePicture(): string | null | undefined {
		return this.props.authorProfilePicture;
	}

	get parentId(): string | null | undefined {
		return this.props.parentId;
	}

	get likesCount(): number | undefined {
		return this.props.likesCount;
	}

	get isLiked(): boolean | undefined {
		return this.props.isLiked;
	}

	get isSaved(): boolean | undefined {
		return this.props.isSaved;
	}

	get repliesCount(): number | undefined {
		return this.props.repliesCount;
	}

	get replies(): Comment[] | undefined {
		return this.props.replies;
	}

	toJSON(): Record<string, any> {
		return {
			id: this.id,
			userId: this.userId,
			postId: this.postId,
			content: this.content,
			createdAt: this.createdAt,
			authorName: this.authorName,
			authorUsername: this.authorUsername,
			authorProfilePicture: this.authorProfilePicture,
			parentId: this.parentId,
			likesCount: this.likesCount,
			isLiked: this.isLiked,
			isSaved: this.isSaved,
			repliesCount: this.repliesCount,
			replies: this.replies?.map(r => r.toJSON())
		};
	}
}
