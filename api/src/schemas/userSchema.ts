import { z } from "zod";

// Schema Completo para Criação de Novo Usuário (Registro)
export const userSchema = z.object({
  nome: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
  cargo: z.string().min(3, "O cargo deve ter no mínimo 3 caracteres."),
  
  // Novos campos para Autenticação
  email: z.string().email("Formato de e-mail inválido.").min(1, "O e-mail é obrigatório."),
  senha: z.string().min(4, "A senha deve ter no mínimo 4 caracteres."),
});

// Para updates parciais (o Front-end pode usar isso para PATCH requests)
export const userUpdateSchema = userSchema.partial();