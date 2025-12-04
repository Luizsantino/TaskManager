import { z } from "zod";

// --- Regras de Validação Comuns ---

// Schema base para IDs que devem ser números inteiros positivos
const idSchema = z.number().int().positive("O ID deve ser um número inteiro positivo.");


// --- Schema para Criação de Tarefa ---

/**
 * Define a estrutura de dados e as regras de validação para a criação de uma Tarefa.
 */
export const tarefaCreateSchema = z.object({
    titulo: z.string()
    .nonempty("O Título é obrigatório e não pode ser vazio.")
        .min(3, "O título deve ter no mínimo 3 caracteres.")
        .max(255, "O título deve ter no máximo 255 caracteres."),

    // IDs de relacionamento obrigatórios na criação
    projetoId: idSchema,
    statusTarefaId: idSchema,

    // Campos Opcionais
    descricao: z.string()
        .max(1000, "A descrição deve ter no máximo 1000 caracteres.")
        .nullable()
        .optional(),
    
    // O prazo é opcional, mas se existir, deve ser uma string de data válida (ISO 8601)
    prazo: z.string()
        .refine((val) => !isNaN(new Date(val).getTime()), "Prazo inválido. Formato esperado: ISO 8601.")
        .nullable()
        .optional(), 
    
    // Opcional, permitindo null se a tarefa não estiver atribuída
    assigneeId: idSchema.nullable().optional(),
    
    // 'concluida' é opcional no payload, pois o backend geralmente define o default como false
    concluida: z.boolean().optional(), 
});

// --- Schema para Atualização de Tarefa ---

/**
 * Schema utilizado para validar o payload ao atualizar uma Tarefa.
 * Todos os campos são opcionais, permitindo a atualização parcial.
 */
export const tarefaUpdateSchema = tarefaCreateSchema.partial(); 

// --- Tipos Inferidos ---

export type TarefaCreatePayload = z.infer<typeof tarefaCreateSchema>;
export type TarefaUpdatePayload = z.infer<typeof tarefaUpdateSchema>;

// --- Schema Específico para Atualização de Status (Útil) ---

/**
 * Schema focado na atualização de status (concluída e/ou mudança de StatusTarefaId).
 */
export const tarefaStatusUpdateSchema = z.object({
    concluida: z.boolean().optional(),
    statusTarefaId: idSchema.optional(),
}).refine(data => data.concluida !== undefined || data.statusTarefaId !== undefined, {
    message: "É necessário fornecer 'concluida' ou 'statusTarefaId' para a atualização de status.",
});