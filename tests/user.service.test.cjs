require("reflect-metadata");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { UserService } = require("../dist/infrastructure/http/services/user.service");

test("create normalizes the email, checks uniqueness, and saves the user", async () => {
	// Replace the outbound port so this use-case test does not need PostgreSQL.
	const savedUsers = [];
	const repository = {
		findByEmail: async () => null,
		save: async (user) => {
			savedUsers.push(user);
			return { ...user, id: "user-1" };
		},
	};
	const service = new UserService(repository);

	const created = await service.create({ name: "  Ana Pérez  ", email: " ANA@EXAMPLE.COM " });

	assert.deepEqual(savedUsers, [{ name: "Ana Pérez", email: "ana@example.com" }]);
	assert.equal(created.id, "user-1");
});

test("create rejects a duplicate email without saving", async () => {
	let saved = false;
	const service = new UserService({
		findByEmail: async () => ({ id: "existing", name: "Ana", email: "ana@example.com" }),
		save: async () => { saved = true; },
	});

	await assert.rejects(
		service.create({ name: "Ana Dos", email: "ana@example.com" }),
		(error) => error.status === 409,
	);
	assert.equal(saved, false);
});
