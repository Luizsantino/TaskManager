import express from "express";
import 'dotenv/config';
import routes from './routes';
import { setupSwagger } from './swagger';
import cors from 'cors';
// Adicionar importação de controller para teste de rota DELETE
import projetoController from './controllers/projetoController'; 


const app = express();

app.use(cors({
    origin: [
        "https://5173-firebase-taskmanager1-1764173036529.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev",
        "https://3000-firebase-taskmanager1-1764173036529.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev",
        "https://9000-firebase-taskmanager1-1764173036529.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev"
    ],
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

app.use(express.json());

// Log de depuração para garantir que o servidor está recebendo requisições
app.use((req, res, next) => {
    // Isso deve aparecer no console do seu servidor para toda requisição
    console.log(`[${req.method}] ${req.url}`); 
    next();
});

setupSwagger(app);

// FORÇANDO A ROTA DE DELETE DE PROJETOS ANTES DA MONTAGEM GERAL (APENAS PARA TESTE)
// Isso garante que o DELETE /api/projetos/:id seja a primeira rota a ser checada
app.delete('/api/projetos/:id', projetoController.deleteProjeto);

// Montagem das rotas principais
app.use('/api', routes);

// Adicionar um middleware de fallback (404) é bom, mas o Express já faz isso
// Se nenhuma rota for encontrada, ele retorna 404 por padrão.
// app.use((req, res) => res.status(404).send('404 Not Found')); 


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🚀 Swagger is running on http://localhost:${PORT}/api-docs`);
});