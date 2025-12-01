import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Formato de e-mail inválido.").min(1, "O e-mail é obrigatório."),
    senha: z.string().min(1, "A senha é obrigatória."),
});

// O Back-end usa a função validate(loginSchema)