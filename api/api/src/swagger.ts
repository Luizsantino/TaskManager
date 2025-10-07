
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de task manager',
      version: '1.0.0',
      description: 'API para gerenciar Projetos e Tarefas',
    },
    servers: [
      {
        url: 'http://localhost:3333',
      },
    ],
  },
  apis: [
    './src/controllers/*.ts'
  ],
  
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};