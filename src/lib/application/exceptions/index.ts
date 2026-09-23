export type ErrorCode = 
	| 'APPLICATION_ERROR'
	| 'NOT_FOUND'
	| 'VALIDATION_ERROR'
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'CONFLICT';

export class ApplicationError extends Error {
	public readonly code: ErrorCode;

	constructor(message: string, code: ErrorCode = 'APPLICATION_ERROR') {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		Error.captureStackTrace(this, this.constructor);
	}

	get statusCode(): number {
		switch (this.code) {
			case 'NOT_FOUND':
				return 404;
			case 'VALIDATION_ERROR':
				return 400;
			case 'UNAUTHORIZED':
				return 401;
			case 'FORBIDDEN':
				return 403;
			case 'CONFLICT':
				return 409;
			default:
				return 500;
		}
	}
}

export class NotFoundError extends ApplicationError {
	constructor(message: string = 'Resource not found') {
		super(message, 'NOT_FOUND');
	}
}

export class ValidationError extends ApplicationError {
	constructor(message: string = 'Validation failed') {
		super(message, 'VALIDATION_ERROR');
	}
}

export class AuthenticationError extends ApplicationError {
	constructor(message: string = 'Authentication failed') {
		super(message, 'UNAUTHORIZED');
	}
}

export class AuthorizationError extends ApplicationError {
	constructor(message: string = 'Permission denied') {
		super(message, 'FORBIDDEN');
	}
}

export class ConflictError extends ApplicationError {
	constructor(message: string = 'Resource conflict') {
		super(message, 'CONFLICT');
	}
}
