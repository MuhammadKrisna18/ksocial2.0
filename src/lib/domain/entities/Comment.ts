export interface CommentProps {
	id: string;
	userId: string;
	postId: string;
	content: string;
	parentId?: string | null;
	createdAt?: Date;
}

export class Comment {
	private constructor(private readonly props: CommentProps) {
		this.props.createdAt = this.props.createdAt ?? new Date();
	}

	static create(props: CommentProps): Comment {
		return new Comment({ ...props });
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
		return this.props.createdAt ?? new Date();
	}

	get parentId(): string | null | undefined {
		return this.props.parentId;
	}

	toJSON(): Record<string, any> {
		return {
			id: this.id,
			userId: this.userId,
			postId: this.postId,
			content: this.content,
			parentId: this.parentId,
			createdAt: this.createdAt
		};
	}
}
