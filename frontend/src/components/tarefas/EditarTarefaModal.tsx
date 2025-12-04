import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    Box,
    Typography,
} from "@mui/material";

import { tarefaUpdateSchema } from "../../schemas/tarefaSchema"; // Schema de atualização
import { validateField } from "../../schemas/validation";
import type { Projeto } from "../../types/projeto";
import type { User } from "../../types/user";
// Tipos de Tarefa e Status (StatusTarefa é o nome do modelo no seu Schema)
import type { Tarefa, StatusTarefa } from "../../types/tarefa"; 
// Serviços
import { getUsers } from "../../services/userService";
import { getStatusTarefas } from "../../services/tarefaService"; // Para buscar opções de status


// --- TIPOS AUXILIARES ---

// Tipagem da Tarefa estendida para incluir os relacionamentos necessários (Projeto, Assignee, Status)
interface TarefaComRelacoes extends Tarefa {
    projeto: Projeto; // O projeto é necessário para exibir o nome
    assignee?: User | null; // Responsável atual
    statusTarefa?: StatusTarefa; // Status de tarefa atual
}

// Define a estrutura do estado formData para edição de tarefa
interface TarefaFormData {
    titulo: string;
    descricao: string;
    prazo: string; // YYYY-MM-DD
    assigneeId: number | null; // ID do responsável
    statusTarefaId: number; // ID do status
    // projetoId não está aqui porque é imutável, mas será enviado no payload se necessário
}

interface EditarTarefaModalProps {
    open: boolean;
    onClose: () => void;
    // O onSave deve aceitar o ID da tarefa e o payload de atualização
    onSave: (id: number, dados: Partial<TarefaFormData>) => Promise<void>; 
    tarefa: TarefaComRelacoes | null; 
}


export const EditarTarefaModal = ({
    open,
    onClose,
    onSave,
    tarefa,
}: EditarTarefaModalProps) => {

    // --- ESTADOS ---
    const [formData, setFormData] = useState<TarefaFormData>({
        titulo: "",
        descricao: "",
        prazo: "",
        assigneeId: null, 
        statusTarefaId: 0, 
    });
    
    // Estados de Validação e Dados
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [allUsuarios, setAllUsuarios] = useState<User[]>([]); 
    // Usando TarefaStatus para o dropdown
    const [allStatuses, setAllStatuses] = useState<StatusTarefa[]>([]); 
    const [loadingData, setLoadingData] = useState(false);
    
    // --- FUNÇÕES DE DADOS E SETUP ---

    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            // Buscando todos os usuários (Assignees) e todos os status de tarefa
            const [usuariosData, statusesData] = await Promise.all([
                getUsers(),
                getStatusTarefas(), 
            ]);
            setAllUsuarios(usuariosData);
            setAllStatuses(statusesData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (open && tarefa) {
            // 1. Formata a data (prazo)
            const prazoFormatted = tarefa.prazo
                ? new Date(tarefa.prazo).toISOString().split("T")[0]
                : "";
            
            // 2. Define o estado inicial do formulário
            setFormData({
                titulo: tarefa.titulo || "",
                descricao: tarefa.descricao || "",
                prazo: prazoFormatted,
                assigneeId: tarefa.assigneeId, 
                statusTarefaId: tarefa.statusTarefaId, 
            });
            setErrors({});
            setTouched({});
            loadData();
        }
    }, [open, tarefa, loadData]);

    // --- FUNÇÕES DE INPUT E VALIDAÇÃO ---

    const handleInputChange = (field: keyof TarefaFormData, value: string | number | null) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (touched[field] && (typeof value === 'string' || typeof value === 'number' || value === null)) {
            // Usamos tarefaUpdateSchema para edição
            const error = validateField(tarefaUpdateSchema, field, value); 
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };
    
    const handleBlur = (field: keyof TarefaFormData) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const value = formData[field];
        
        if (typeof value === 'string' || typeof value === 'number' || value === null) {
            // NOTE: Corrigido o schema de validação para usar 'tarefaUpdateSchema'
            const error = validateField(tarefaUpdateSchema, field, value); 
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    // --- SUBMISSÃO ---
    
    const handleSubmit = async () => {
        if (!tarefa) return;

        // 1. Lógica de validação (completa)
        const newTouched: Record<string, boolean> = {};
        const newErrors: Record<string, string> = {};

        for (const key of Object.keys(formData) as Array<keyof TarefaFormData>) {
            newTouched[key] = true;
            const value = formData[key];
            if (typeof value === 'string' || typeof value === 'number' || value === null) {
                const error = validateField(tarefaUpdateSchema, key, value);
                if (error) newErrors[key] = error;
            }
        }

        setTouched(newTouched);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            // 2. Constrói o payload para onSave
            const payload: Partial<TarefaFormData> = {
                // Campos básicos
                titulo: formData.titulo.trim(),
                descricao: formData.descricao.trim() || undefined, // Envia undefined se vazio
                // CORREÇÃO TS2322: Usa undefined se o campo prazo estiver vazio, em vez de null.
                // O backend receberá a chave omitida, o que é aceitável para um PATCH/PUT.
                prazo: formData.prazo ? new Date(formData.prazo).toISOString() : undefined,
                
                // Campos de Relacionamento (IDs)
                statusTarefaId: formData.statusTarefaId,
                assigneeId: formData.assigneeId,
            };

            // onSave chama updateTarefa com o payload completo
            await onSave(tarefa.id, payload);
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar tarefa:", error);
        } finally {
            setLoading(false);
        }
    };

    const hasValidationErrors = useMemo(() => {
        return Object.values(errors).some(error => error !== '');
    }, [errors]);

    // --- RENDERIZAÇÃO (JSX) ---

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Editar Tarefa: {tarefa?.titulo}</DialogTitle>
            <DialogContent>
                {loadingData ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4, mt: 2 }}>
                        <CircularProgress />
                        <Typography ml={2}>Carregando dados...</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        
                        {/* Campo: PROJETO (SOMENTE LEITURA) */}
                        <TextField
                            label="Projeto"
                            value={tarefa?.projeto.nome || 'N/A'}
                            InputProps={{
                                readOnly: true,
                            }}
                            fullWidth
                            variant="filled" // Destaca que é readonly
                        />

                        {/* Campo: Título */}
                        <TextField
                            label="Título da Tarefa"
                            value={formData.titulo}
                            onChange={(e) => handleInputChange("titulo", e.target.value)}
                            onBlur={() => handleBlur("titulo")}
                            error={touched.titulo && !!errors.titulo}
                            helperText={touched.titulo && errors.titulo}
                            fullWidth
                        />

                        {/* Campo: Descrição */}
                        <TextField
                            label="Descrição"
                            value={formData.descricao}
                            onChange={(e) => handleInputChange("descricao", e.target.value)}
                            onBlur={() => handleBlur("descricao")}
                            error={touched.descricao && !!errors.descricao}
                            helperText={touched.descricao && errors.descricao}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        
                        {/* Campo: Status (Dropdown) */}
                        <TextField
                            select
                            label="Status"
                            value={formData.statusTarefaId || ''} 
                            onChange={(e) =>
                                handleInputChange("statusTarefaId", Number(e.target.value))
                            }
                            onBlur={() => handleBlur("statusTarefaId")}
                            fullWidth
                        >
                            {allStatuses.map((status) => (
                                <MenuItem key={status.id} value={status.id}>
                                    {status.nome}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Campo: Responsável (Assignee) */}
                        <TextField
                            select
                            label="Responsável (Assignee)"
                            value={formData.assigneeId || ''}
                            onChange={(e) =>
                                handleInputChange("assigneeId", e.target.value === '' ? null : Number(e.target.value))
                            }
                            onBlur={() => handleBlur("assigneeId")}
                            // Aqui você precisaria de validação extra para assigneeId
                            fullWidth
                        >
                             <MenuItem value={""}>Não Atribuído</MenuItem>
                            {allUsuarios.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.nome}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Campo: Prazo */}
                        <TextField
                            label="Prazo"
                            type="date"
                            value={formData.prazo}
                            onChange={(e) => handleInputChange("prazo", e.target.value)}
                            onBlur={() => handleBlur("prazo")}
                            error={touched.prazo && !!errors.prazo}
                            helperText={touched.prazo && errors.prazo}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || loadingData || hasValidationErrors}
                >
                    {loading ? <CircularProgress size={24} /> : "Salvar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};