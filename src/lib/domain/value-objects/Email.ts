export class Email {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static create(raw: string): Email {
		const trimmed = raw.trim().toLowerCase();
		if (!Email.isValid(trimmed)) {
			throw new Error(`Invalid email address: ${raw}`);
		}
		return new Email(trimmed);
	}

	static isValid(raw: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
	}

	toString(): string {
		return this.value;
	}

	equals(other: Email): boolean {
		return this.value === other.value;
	}
}
