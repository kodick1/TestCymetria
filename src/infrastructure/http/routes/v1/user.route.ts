import { Router } from "express";
import { UserController } from "../../controllers/user.controller";
import { container } from "tsyringe";
import { withTryCatch } from "../../../../decorators/withTryCatch";

const router = Router();

const userController = container.resolve(UserController);

router.get("/", withTryCatch(userController.getAllUsers.bind(userController)));
router.post("/", withTryCatch(userController.createUser.bind(userController)));
router.delete("/", withTryCatch(userController.deleteUser.bind(userController)));



export default router;

