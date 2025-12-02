import { z } from "zod";

// Define a estrutura de dados e as regras de validação para a criação de um Projeto
export const projetoSchema = z.object({
    nome: z
        .string()
        .min(3, "O nome do projeto deve ter no mínimo 3 caracteres.")
        .max(100, "O nome não pode exceder 100 caracteres."),
    
    descricao: z
        .string()
        .min(10, "A descrição do projeto deve ter no mínimo 10 caracteres."),

    // As datas são enviadas como strings no formato ISO (Date.toISOString())
    dataInicio: z
        .string()
        .refine((val) => !isNaN(new Date(val).getTime()), "Data de Início inválida."),
    
    dataFimPrevista: z
        .string()
        .refine((val) => !isNaN(new Date(val).getTime()), "Data Fim Prevista inválida."),
    
    
});

// Schema para atualização (campos opcionais)
export const projetoUpdateSchema = projetoSchema.partial();