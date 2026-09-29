import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { container } from "tsyringe";

const userService = container.resolve(UserService);
export class UserController {
	async getAllUsers(req: Request, res: Response) {
		const users = await userService.getAllUsers();
		res.json(users);
	}
	async createUser(req: Request, res: Response) {
		const { name, email } = req.body;
		const user = await userService.create({
			name,
			email,
		});
		res.status(201).json({ ok: true, user });
	}

	//metodo deleteUser
	async deleteUser(req: Request, res: Response) {
		const { id } = req.params;
		const deleted = await userService.delete(id);
		if (!deleted) {
			res.status(404).json({ ok: false, message: "User not found" });
			return;
		}
		res.json({ ok: true, message: "User deleted successfully" });
	}
	//metodo updateUser
	async updateUser(req: Request, res: Response) {
		const { id } = req.params;
		const { name, email } = req.body;
		const updatedUser = await userService.update(id, { name, email });
		if (!updatedUser) {
			res.status(404).json({ ok: false, message: "User not found" });
			return;
		}
		res.json({ ok: true, user: updatedUser });
	}
}
