import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { container } from "tsyringe";
import { HttpException } from "../errors/HttpException";

const userService = container.resolve(UserService);

export class UserController {
	async getAllUsers(req: Request, res: Response) {
		const page = Number(req.query.page ?? 1);
		const pageSize = Number(req.query.pageSize ?? 10);
		const search = String(req.query.search ?? "").trim();
		if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
			throw new HttpException(400, "page must be positive and pageSize must be between 1 and 100");
		}

		const { items, total } = await userService.getUsers(page, pageSize, search);
		res.json({ data: items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
	}

	async getUserById(req: Request, res: Response) {
		const user = await userService.getUserById(this.validateId(req.params.id));
		if (!user) {
			res.status(404).json({ success: false, error: { message: "User not found" } });
			return;
		}
		res.json({ data: user });
	}

	async exportUsers(req: Request, res: Response) {
		const escapeCsv = (value: string) => {
			const safeValue = /^[\t\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
			return `"${safeValue.replace(/"/g, '""')}"`;
		};
		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", 'attachment; filename="users.csv"');
		res.write("\uFEFFid,name,email\r\n");

		const search = String(req.query.search ?? "").trim();
		// Cursor-based batches bound memory use for large exports.
		const batchSize = 500;
		let afterId: string | null = null;
		while (!res.destroyed) {
			const users = await userService.getUsersForExport(afterId, batchSize, search);
			if (res.destroyed) break;
			if (users.length === 0) break;
			const rows = users.map((user) => [user.id ?? "", user.name, user.email].map(escapeCsv).join(","));
			const lastId = users[users.length - 1].id;
			if (!lastId) throw new Error("Export batch returned a user without an ID");
			afterId = lastId;
			if (!res.write(`${rows.join("\r\n")}\r\n`) && !res.destroyed) {
				// Respect backpressure so slow clients do not grow the response buffer indefinitely.
				await waitForDrainOrClose(res);
			}
			if (users.length < batchSize) break;
		}
		if (!res.destroyed) res.end();
	}

	async createUser(req: Request, res: Response) {
		const user = await userService.create(req.body);
		res.status(201).json({ data: user });
	}

	async deleteUser(req: Request, res: Response) {
		const deleted = await userService.delete(this.validateId(req.params.id));
		if (!deleted) {
			res.status(404).json({ success: false, error: { message: "User not found" } });
			return;
		}
		res.status(204).send();
	}

	async updateUser(req: Request, res: Response) {
		const updatedUser = await userService.update(this.validateId(req.params.id), req.body);
		if (!updatedUser) {
			res.status(404).json({ success: false, error: { message: "User not found" } });
			return;
		}
		res.json({ data: updatedUser });
	}

	private validateId(id: string): string {
		if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
			throw new HttpException(400, "El id debe ser un UUID válido");
		}
		return id;
	}
}

function waitForDrainOrClose(res: Response): Promise<void> {
	if (res.destroyed) return Promise.resolve();
	return new Promise((resolve, reject) => {
		const cleanup = () => {
			res.off("drain", onDrain);
			res.off("close", onClose);
			res.off("error", onError);
		};
		const onDrain = () => { cleanup(); resolve(); };
		const onClose = () => { cleanup(); resolve(); };
		const onError = (error: Error) => { cleanup(); reject(error); };
		res.once("drain", onDrain);
		res.once("close", onClose);
		res.once("error", onError);
	});
}
