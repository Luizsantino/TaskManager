import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Formato de e-mail inválido.").min(1, "O e-mail é obrigatório."),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

// O Back-end usa a função validate(loginSchema)