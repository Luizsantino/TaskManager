import { Router } from 'express';
import projetoRoutes from './projetoRoutes';
import tarefaRoutes from './tarefaRoutes';   
import userRoutes from './userRoutes';
import authRoutes from './authRoutes'

const routes = Router();

routes.use(projetoRoutes);
routes.use(tarefaRoutes);
routes.use(userRoutes);
routes.use(authRoutes)

export default routes;