require("reflect-metadata");
const { test, mock } = require("node:test");
const assert = require("node:assert/strict");
const { Op } = require("sequelize");
const { UserModel } = require("../dist/infrastructure/db/sequelize/models/user.model");
const { UserRepositorySequelize } = require("../dist/infrastructure/db/sequelize/repositories/UserRepositorySequelize");

test("findAll applies pagination and a deterministic order, then maps to domain users", async () => {
	// Mock the ORM boundary so the adapter can be verified without a database.
	const findAndCountAll = mock.method(UserModel, "findAndCountAll", async () => ({
		rows: [{ id: "user-1", name: "Ana Pérez", email: "ana@example.com" }],
		count: 21,
	}));
	const repository = new UserRepositorySequelize();

	const result = await repository.findAll(2, 10, "ana");
	const options = findAndCountAll.mock.calls[0].arguments[0];

	assert.equal(options.limit, 10);
	assert.equal(options.offset, 10);
	assert.deepEqual(options.order, [["createdAt", "DESC"], ["id", "DESC"]]);
	assert.equal(result.total, 21);
	assert.equal(result.items[0].name, "Ana Pérez");
	assert.equal(result.items[0].email, "ana@example.com");
	assert.equal(result.items[0].id, "user-1");
});

test("findAllForExport fetches the next bounded batch after its UUID cursor", async () => {
	const findAll = mock.method(UserModel, "findAll", async () => [
		{ id: "user-2", name: "Ana Pérez", email: "ana@example.com" },
	]);
	const repository = new UserRepositorySequelize();

	const result = await repository.findAllForExport("user-1", 500, "ana");
	const options = findAll.mock.calls[0].arguments[0];

	assert.equal(options.limit, 500);
	assert.deepEqual(options.order, [["id", "ASC"]]);
	assert.equal(options.where.id[Op.gt], "user-1");
	assert.equal(result[0].id, "user-2");
});
