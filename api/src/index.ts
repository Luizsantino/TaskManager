import express from "express";
import 'dotenv/config';
import routes from './routes';
import { setupSwagger } from './swagger';
import cors from 'cors';

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

setupSwagger(app);

app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🚀 Swagger is running on http://localhost:${PORT}/api-docs`);
});
