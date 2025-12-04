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
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Chip,
    Typography,
} from "@mui/material";
import { projetoUpdateSchema } from "../../schemas/projetoSchema";
import { validateField } from "../../schemas/validation";
import type { Projeto } from "../../types/projeto";
import type { User } from "../../types/user";
import type { StatusTarefa } from "../../types/tarefa"; // Usando StatusTarefa como base para Status
// Importações de serviços
import { getUsers } from "../../services/userService";

// --- TIPOS AUXILIARES ---

// Interface para o objeto de junção retornado pelo backend
interface ProjetoUsuario {
    usuario: { id: number, nome: string };
}
// Interface do Projeto estendida para incluir os relacionamentos
interface ProjetoComRelacoes extends Projeto {
    projetoUsuarios?: ProjetoUsuario[];
}

// Assumindo que o tipo de status retornado da API é similar a StatusTarefa
type ProjetoStatus = StatusTarefa; 

// Define a estrutura do estado formData para edição de projeto, incluindo relacionamentos
interface ProjetoFormData {
    nome: string;
    descricao: string;
    dataInicio: string;
    dataFimPrevista: string;
    statusId: number; // ID do status selecionado
    membrosIds: number[]; // IDs dos usuários selecionados
}

interface EditarProjetoModalProps {
    open: boolean;
    onClose: () => void;
    // O onSave deve aceitar 'statusId' e 'membrosIds' para o update
    onSave: (id: number, dados: Partial<ProjetoFormData>) => Promise<void>; 
    projeto: ProjetoComRelacoes | null; 
}

// --- FUNÇÃO MOCK/PLACEHOLDER PARA BUSCA DE STATUS ---
// NOTA: Você deve substituir esta função pela chamada real ao seu StatusService.
const fetchAllStatuses = async (): Promise<ProjetoStatus[]> => {
    // Simulação de delay de API
    await new Promise(resolve => setTimeout(resolve, 300));
    // DADOS MOCK: Substitua pela chamada real à API (ex: StatusService.getAllStatuses())
    return [
        { id: 1, nome: "Pendente" } as ProjetoStatus,
        { id: 2, nome: "Em Andamento" } as ProjetoStatus,
        { id: 3, nome: "Concluído" } as ProjetoStatus,
        { id: 4, nome: "Arquivado" } as ProjetoStatus,
    ];
};


export const EditarProjetoModal = ({
    open,
    onClose,
    onSave,
    projeto,
}: EditarProjetoModalProps) => {

    // --- ESTADOS ---
    const [formData, setFormData] = useState<ProjetoFormData>({
        nome: "",
        descricao: "",
        dataInicio: "",
        dataFimPrevista: "",
        statusId: 0, 
        membrosIds: [],
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [allUsuarios, setAllUsuarios] = useState<User[]>([]); 
    const [allStatuses, setAllStatuses] = useState<ProjetoStatus[]>([]); // Lista de opções de status
    const [loadingData, setLoadingData] = useState(false);
    
    // --- FUNÇÕES DE DADOS E SETUP ---

    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            // Chamando getUsers e a função mock/real de status
            const [usuariosData, statusesData] = await Promise.all([
                getUsers(),
                fetchAllStatuses(), // Usando a função mock/real
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
        if (open && projeto) {
            // 1. Formata as datas
            const dataInicioFormatted = projeto.dataInicio
                ? new Date(projeto.dataInicio).toISOString().split("T")[0]
                : "";
            const dataFimPrevistaFormatted = projeto.dataFimPrevista
                ? new Date(projeto.dataFimPrevista).toISOString().split("T")[0]
                : "";
            
            // 2. Extrai IDs dos membros atuais
            const currentMembrosIds = projeto.projetoUsuarios 
                ? projeto.projetoUsuarios.map(pu => pu.usuario.id) 
                : [];

            // 3. Define o estado inicial do formulário
            setFormData({
                nome: projeto.nome || "",
                descricao: projeto.descricao || "",
                dataInicio: dataInicioFormatted,
                dataFimPrevista: dataFimPrevistaFormatted,
                statusId: projeto.statusId, 
                membrosIds: currentMembrosIds, 
            });
            setErrors({});
            setTouched({});
            loadData();
        }
    }, [open, projeto, loadData]);

    // --- FUNÇÕES DE INPUT E VALIDAÇÃO ---

    const handleInputChange = (field: keyof ProjetoFormData, value: string | number | number[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (touched[field] && (typeof value === 'string' || typeof value === 'number')) {
            const error = validateField(projetoUpdateSchema, field, value);
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };
    
    // Handler específico para o multi-select de membros
    const handleMembrosChange = (event: any) => {
        const { target: { value } } = event;
        const selectedIds = typeof value === 'string' ? value.split(',').map(Number) : value;
        handleInputChange("membrosIds", selectedIds);
    };


    const handleBlur = (field: keyof ProjetoFormData) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const value = formData[field];
        
        if (typeof value === 'string' || typeof value === 'number') {
            const error = validateField(projetoUpdateSchema, field, value);
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    // --- SUBMISSÃO ---
    
    const handleSubmit = async () => {
        if (!projeto) return;

        // 1. Lógica de validação (completa)
        const newTouched: Record<string, boolean> = {};
        const newErrors: Record<string, string> = {};

        for (const key of Object.keys(formData) as Array<keyof ProjetoFormData>) {
            newTouched[key] = true;
            const value = formData[key];
            if (typeof value === 'string' || typeof value === 'number') {
                const error = validateField(projetoUpdateSchema, key, value);
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
            const payload: Partial<ProjetoFormData> = {
                // Campos básicos
                nome: formData.nome.trim(),
                descricao: formData.descricao.trim(),
                dataInicio: new Date(formData.dataInicio).toISOString(),
                dataFimPrevista: new Date(formData.dataFimPrevista).toISOString(),
                
                // Campos de Relacionamento (IDs)
                statusId: formData.statusId,
                membrosIds: formData.membrosIds,
            } as Partial<ProjetoFormData>; // Cast seguro para o onSave

            // onSave chama updateProjeto com o payload completo
            await onSave(projeto.id, payload);
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar projeto:", error);
        } finally {
            setLoading(false);
        }
    };

    // Cálculo de erros de validação
    const hasValidationErrors = useMemo(() => {
        return Object.values(errors).some(error => error !== '');
    }, [errors]);

    // --- RENDERIZAÇÃO (JSX) ---

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogContent>
                {loadingData ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4, mt: 2 }}>
                        <CircularProgress />
                        <Typography ml={2}>Carregando dados...</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        
                        {/* Campo: Nome */}
                        <TextField
                            label="Nome do Projeto"
                            value={formData.nome}
                            onChange={(e) => handleInputChange("nome", e.target.value)}
                            onBlur={() => handleBlur("nome")}
                            error={touched.nome && !!errors.nome}
                            helperText={touched.nome && errors.nome}
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
                            label="Status do Projeto"
                            value={formData.statusId || ''} 
                            onChange={(e) =>
                                handleInputChange("statusId", Number(e.target.value))
                            }
                            onBlur={() => handleBlur("statusId")}
                            fullWidth
                        >
                            {/* Garante que a lista de status esteja carregada */}
                            {allStatuses.map((status) => (
                                <MenuItem key={status.id} value={status.id}>
                                    {status.nome}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Campo: Data de Início */}
                        <TextField
                            label="Data de Início"
                            type="date"
                            value={formData.dataInicio}
                            onChange={(e) => handleInputChange("dataInicio", e.target.value)}
                            onBlur={() => handleBlur("dataInicio")}
                            error={touched.dataInicio && !!errors.dataInicio}
                            helperText={touched.dataInicio && errors.dataInicio}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* Campo: Data Fim Prevista */}
                        <TextField
                            label="Data Fim Prevista"
                            type="date"
                            value={formData.dataFimPrevista}
                            onChange={(e) =>
                                handleInputChange("dataFimPrevista", e.target.value)
                            }
                            onBlur={() => handleBlur("dataFimPrevista")}
                            error={touched.dataFimPrevista && !!errors.dataFimPrevista}
                            helperText={touched.dataFimPrevista && errors.dataFimPrevista}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        
                        {/* Multi-select de usuários (Membros da Equipe) */}
                        <FormControl fullWidth>
                            <InputLabel id="membros-label">Membros da Equipe</InputLabel>
                            <Select
                                labelId="membros-label"
                                multiple
                                value={formData.membrosIds}
                                onChange={handleMembrosChange}
                                input={<OutlinedInput label="Membros da Equipe" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((id) => {
                                            const user = allUsuarios.find(u => u.id === id);
                                            return <Chip key={id} label={user?.nome || `ID: ${id}`} size="small" />;
                                        })}
                                    </Box>
                                )}
                            >
                                {allUsuarios.map(user => (
                                    <MenuItem key={user.id} value={user.id}>{user.nome}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

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