import { Request, Response, NextFunction } from "express";
import { HttpException } from "../errors/HttpException";

export function errorHandler(err: Error | HttpException, req: Request, res: Response, next: NextFunction): void {
	console.error("[Error]", err);
	if (res.headersSent) {
		res.destroy(err);
		return;
	}

	const status = err instanceof HttpException ? err.status : 500;
	const message = err.message || "Internal Server Error";

	res.status(status).json({
		success: false,
		error: {
			message,
		},
	});
}
