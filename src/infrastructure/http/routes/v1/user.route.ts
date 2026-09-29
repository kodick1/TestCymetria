import { Router } from "express";
import { UserController } from "../../controllers/user.controller";
import { container } from "tsyringe";
import { withTryCatch } from "../../../../decorators/withTryCatch";

const router = Router();

const userController = container.resolve(UserController);

router.get("/", withTryCatch(userController.getAllUsers.bind(userController)));
router.get("/export.csv", withTryCatch(userController.exportUsers.bind(userController)));
router.get("/:id", withTryCatch(userController.getUserById.bind(userController)));
router.post("/", withTryCatch(userController.createUser.bind(userController)));
router.delete("/:id", withTryCatch(userController.deleteUser.bind(userController)));
router.patch("/:id", withTryCatch(userController.updateUser.bind(userController)));



export default router;

