import { Router } from 'express';
import projetoRoutes from './projetoRoutes';
import tarefaRoutes from './tarefaRoutes';   
import userRoutes from './userRoutes';

const routes = Router();

routes.use(projetoRoutes);
routes.use(tarefaRoutes);
routes.use(userRoutes);

export default routes;