import { UserRepository } from "../../../../domain/ports/UserRepository";
import { User } from "../../../../domain/entities/User";
import { UserModel } from "../models/user.model";
import { Op } from "sequelize";

export class UserRepositorySequelize implements UserRepository {
	async findAll(page: number, pageSize: number, search: string): Promise<{ items: User[]; total: number }> {
		const { rows, count } = await UserModel.findAndCountAll({
			where: search ? { [Op.or]: [{ name: { [Op.iLike]: `%${search}%` } }, { email: { [Op.iLike]: `%${search}%` } }] } : undefined,
			order: [["createdAt", "DESC"], ["id", "DESC"]],
			limit: pageSize,
			offset: (page - 1) * pageSize,
		});
		return { items: rows.map((u) => new User(u.name, u.email, u.id)), total: count };
	}

	async findAllForExport(afterId: string | null, pageSize: number, search: string): Promise<User[]> {
		// Use the UUID cursor instead of OFFSET so later batches stay efficient as the export grows.
		const users = await UserModel.findAll({
			where: {
				...(afterId ? { id: { [Op.gt]: afterId } } : {}),
				...(search ? { [Op.or]: [{ name: { [Op.iLike]: `%${search}%` } }, { email: { [Op.iLike]: `%${search}%` } }] } : {}),
			},
			order: [["id", "ASC"]],
			limit: pageSize,
		});
		return users.map((u) => new User(u.name, u.email, u.id));
	}

	async findById(id: string): Promise<User | null> {
		const user = await UserModel.findByPk(id);
		return user ? new User(user.name, user.email, user.id) : null;
	}

	async save(user: User): Promise<User> {
		const created = await UserModel.create({
			id: user.id,
			name: user.name,
			email: user.email,
		});
		return new User(created.name, created.email, created.id);
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = await UserModel.findOne({ where: { email } });
		return user ? new User(user.name, user.email, user.id) : null;
	}

	// Persist the update and return a domain entity rather than an ORM model.
	async update(id: string, user: Partial<User>): Promise<User | null> {
		const existingUser = await UserModel.findByPk(id);
		if (!existingUser) {
			return null;
		}
		await existingUser.update(user);
		return new User(existingUser.name, existingUser.email, existingUser.id);
	}

	// Return false when the requested record does not exist.
	async delete(id: string): Promise<boolean> {
		const existingUser = await UserModel.findByPk(id);
		if (!existingUser) {
			return false;
		}
		await existingUser.destroy();
		return true;
	}
}
