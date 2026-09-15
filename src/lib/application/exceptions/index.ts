export class ApplicationError extends Error {
	public readonly statusCode: number;

	constructor(message: string, statusCode: number = 500) {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class NotFoundError extends ApplicationError {
	constructor(message: string = 'Resource not found') {
		super(message, 404);
	}
}

export class ValidationError extends ApplicationError {
	constructor(message: string = 'Validation failed') {
		super(message, 400);
	}
}

export class AuthenticationError extends ApplicationError {
	constructor(message: string = 'Authentication failed') {
		super(message, 401);
	}
}

export class ConflictError extends ApplicationError {
	constructor(message: string = 'Resource conflict') {
		super(message, 409);
	}
}
