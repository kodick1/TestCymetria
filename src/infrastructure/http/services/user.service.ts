import { UserRepository } from "../../../domain/ports/UserRepository";
import { User } from "../../../domain/entities/User";
import { injectable, inject } from "tsyringe";
import { HttpException } from "../errors/HttpException";

@injectable()
export class UserService {
	constructor(
		@inject("UserRepository")
		private readonly userRepository: UserRepository
	) {}

	async getUsers(page: number, pageSize: number, search: string) {
		return this.userRepository.findAll(page, pageSize, search);
	}

	async getUserById(id: string): Promise<User | null> {
		return this.userRepository.findById(id);
	}

	async getUsersForExport(afterId: string | null, pageSize: number, search: string): Promise<User[]> {
		return this.userRepository.findAllForExport(afterId, pageSize, search);
	}

	async create(user: User): Promise<User> {
		user.name = user.name?.trim();
		user.email = user.email?.trim().toLowerCase();
		this.validateUser(user.name, user.email);
		if (await this.userRepository.findByEmail(user.email)) {
			throw new HttpException(409, "User with this email already exists");
		}
		return this.userRepository.save(user);
	}

	async delete(id: string): Promise<boolean> {
		return this.userRepository.delete(id);
	}

	async update(id: string, user: Partial<User>): Promise<User | null> {
		if (user.name !== undefined) user.name = user.name.trim();
		if (user.email !== undefined) user.email = user.email.trim().toLowerCase();
		if ((user.name !== undefined && !user.name) || (user.email !== undefined && !user.email)) {
			throw new HttpException(400, "El nombre y el correo no pueden estar vacíos");
		}

		const existingUser = await this.userRepository.findById(id);
		if (!existingUser) return null;
		this.validateUser(user.name ?? existingUser.name, user.email ?? existingUser.email);
		if (user.email && user.email !== existingUser.email && await this.userRepository.findByEmail(user.email)) {
			throw new HttpException(409, "User with this email already exists");
		}
		return this.userRepository.update(id, user);
	}

	private validateUser(name: string, email: string): void {
		if (!name || !email) throw new HttpException(400, "El nombre y el correo son obligatorios");
		if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpException(400, "Escribe un correo electrónico válido");
	}
}
