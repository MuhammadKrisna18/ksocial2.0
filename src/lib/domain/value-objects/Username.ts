export class Username {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static create(raw: string): Username {
		const trimmed = raw.trim();

		if (trimmed.length < 3) {
			throw new Error('Username must be at least 3 characters long');
		}

		if (trimmed.length > 32) {
			throw new Error('Username must be at most 32 characters long');
		}

		if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
			throw new Error('Username may only contain letters, numbers, and underscores');
		}

		return new Username(trimmed);
	}

	toString(): string {
		return this.value;
	}

	equals(other: Username): boolean {
		return this.value === other.value;
	}
}
