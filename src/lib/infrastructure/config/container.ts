import { HashService } from '$lib/infrastructure/external-services/HashService';
import { TokenService } from '$lib/infrastructure/external-services/TokenService';
import { DrizzleUserRepository } from '$lib/infrastructure/repositories/DrizzleUserRepository';
import { DrizzleRoleRepository } from '$lib/infrastructure/repositories/DrizzleRoleRepository';
import { LoginUseCase } from '$lib/application/use-cases/LoginUseCase';
import { RegisterUseCase } from '$lib/application/use-cases/RegisterUseCase';
import { ValidateTokenUseCase } from '$lib/application/use-cases/ValidateTokenUseCase';

const hashService = new HashService();
const tokenService = new TokenService();
const userRepository = new DrizzleUserRepository();
const roleRepository = new DrizzleRoleRepository();

export const container = {
	hashService,
	tokenService,
	userRepository,
	roleRepository,
	loginUseCase: new LoginUseCase(userRepository, hashService, tokenService),
	registerUseCase: new RegisterUseCase(userRepository, roleRepository, hashService, tokenService),
	validateTokenUseCase: new ValidateTokenUseCase(tokenService)
};
