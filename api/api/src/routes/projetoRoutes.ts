import { Router } from "express";
import projetoController from "../controllers/projetoController";

const routes = Router();

routes.post("/", projetoController.createProjeto);
routes.get("/", projetoController.getProjetos);
routes.get("/:id", projetoController.getProjetoById);
routes.put("/:id", projetoController.updateProjeto);
routes.delete("/:id", projetoController.deleteProjeto);



export default routes



