export class Password {
	private readonly value: string;
	readonly isHashed: boolean;

	private constructor(value: string, isHashed: boolean) {
		this.value = value;
		this.isHashed = isHashed;
	}

	static createRaw(raw: string): Password {
		return new Password(raw, false);
	}

	static fromHash(hash: string): Password {
		return new Password(hash, true);
	}

	toString(): string {
		return this.value;
	}
}
