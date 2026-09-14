export const ROLE_NAMES = ['admin', 'user'] as const;

export type RoleNameType = (typeof ROLE_NAMES)[number];

export class RoleName {
	private readonly value: RoleNameType;

	private constructor(value: RoleNameType) {
		this.value = value;
	}

	static create(raw: string): RoleName {
		if (!ROLE_NAMES.includes(raw as RoleNameType)) {
			throw new Error(`Invalid role name: ${raw}. Must be one of: ${ROLE_NAMES.join(', ')}`);
		}
		return new RoleName(raw as RoleNameType);
	}

	toString(): string {
		return this.value;
	}

	equals(other: RoleName): boolean {
		return this.value === other.value;
	}

	isAdmin(): boolean {
		return this.value === 'admin';
	}
}
