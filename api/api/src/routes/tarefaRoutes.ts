import { Router } from "express";
import tarefaController from "../controllers/tarefaController";

const routes = Router();

routes.post("/", tarefaController.createTarefa);
routes.get("/", tarefaController.getTarefas);
routes.get("/:id", tarefaController.getTarefaById);
routes.put("/:id", tarefaController.updateTarefa);
routes.delete("/:id", tarefaController.deleteTarefa);

export default routes;