import { Router } from "express";
import userController from "../controllers/userController";

const routes = Router();

routes.get("/", userController.getUsers);
routes.get("/:id", userController.getUserById);
routes.post("/", userController.createUser);
routes.put("/:id", userController.updateUser);
routes.delete("/:id", userController.deleteUser);

export default routes;