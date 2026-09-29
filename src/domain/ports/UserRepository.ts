import { User } from "../entities/User";

export interface UserRepository {
	findAll(page: number, pageSize: number, search: string): Promise<{ items: User[]; total: number }>;
	findAllForExport(afterId: string | null, pageSize: number, search: string): Promise<User[]>;
	findById(id: string): Promise<User | null>;
	save(user: User): Promise<User>;
	findByEmail(email: string): Promise<User | null>;
	update(id: string, user: Partial<User>): Promise<User | null>;
	delete(id: string): Promise<boolean>;
}
