import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Box,
    MenuItem,
    Typography,
} from "@mui/material";

// Importações de serviços e tipos
import { getProjetos } from "../../services/projetoService"; 
import { createTarefa } from "../../services/tarefaService"; 
import { getUsers } from "../../services/userService"; 
import type { User } from "../../types/user";
import type { Projeto } from "../../types/projeto"; 
import type { Tarefa, TarefaCreatePayload } from "../../types/tarefa"; // TarefaStatus não é mais necessário aqui

// Importação dos schemas de validação
import { tarefaCreateSchema } from "../../schemas/tarefaSchema"; 
import { validateField } from "../../schemas/validation";


// --- Interfaces e Estados Iniciais ---

// Reflete o payload necessário para o Zod (statusTarefaId removido do estado)
interface FormData {
    titulo: string;
    descricao: string; 
    prazo: string; 
    projetoId: number;
    assigneeId: number | null;
}

const initialFormData: FormData = {
    titulo: "",
    descricao: "",
    prazo: "",
    projetoId: 0, 
    assigneeId: null, 
};


interface CriarTarefaModalProps {
    open: boolean;
    onClose: () => void;
    onTarefaCreated: (tarefa: Tarefa) => void; // Callback para o pai
}


export const CriarTarefaModal = ({
    open,
    onClose,
    onTarefaCreated,
}: CriarTarefaModalProps) => {
    
    // Estados
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    
    // Dados de Carregamento
    const [allUsuarios, setAllUsuarios] = useState<User[]>([]);
    const [allProjetos, setAllProjetos] = useState<Projeto[]>([]);
    // Status removido: const [allStatuses, setAllStatuses] = useState<TarefaStatus[]>([]); 
    
    const [loading, setLoading] = useState(false); // Submissão
    const [loadingData, setLoadingData] = useState(false); // Carregamento de dados

    // statusTarefaId removido da desestruturação
    const { titulo, descricao, prazo, projetoId, assigneeId } = formData; 
    
    // --- Funções de Dados e Setup ---

    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            // Busca Projetos e Usuários (Status Tarefa removido)
            const [projetosData, usuariosData] = await Promise.all([
                getProjetos(),
                getUsers(),
                // getStatusTarefas() Removido
            ]);
            
            setAllProjetos(projetosData);
            setAllUsuarios(usuariosData);
            
            // Lógica de definir status padrão removida
            
        } catch (err) {
            console.error("Erro ao buscar dados:", err);
        } finally {
            setLoadingData(false);
        }
    }, []);
    
    const handleReset = () => {
        setFormData(initialFormData);
        setErrors({});
        setTouched({});
        setLoading(false);
    }

    const handleClose = () => {
        handleReset();
        onClose();
    };

    useEffect(() => {
        if (open) {
            handleReset(); 
            loadData();
        }
    }, [open, loadData]); 

    // --- Funções de Validação e Input ---

    // O field statusTarefaId não existe mais no FormData, mas a validação ainda usa o schema
    const handleInputChange = (field: keyof FormData, value: string | number | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Validação Zod só é aplicada se já foi tocado
        if (touched[field]) {
            // NOTE: O erro de validação ainda pode ocorrer se você não remover statusTarefaId do tarefaCreateSchema.
            // Para ser robusto, vou ignorar a validação do statusTarefaId aqui, já que ele não está no formulário.
            if (field === 'projetoId' || field === 'titulo' || field === 'descricao' || field === 'prazo' || field === 'assigneeId') {
                 const error = validateField(tarefaCreateSchema, field, value); 
                 setErrors((prev) => ({ ...prev, [field]: error }));
            }
        }
    };
    
    const handleBlur = (field: keyof FormData) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const value = formData[field];
        
        // Valida apenas campos presentes no formulário
        if (field === 'projetoId' || field === 'titulo' || field === 'descricao' || field === 'prazo' || field === 'assigneeId') {
            const error = validateField(tarefaCreateSchema, field, value); 
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };


    // --- Função de Submissão ---

    const handleSubmit = async () => {
        
        const newTouched: Record<string, boolean> = {};
        const newErrors: Record<string, string> = {};
        
        // 1. Validação de todos os campos (StatusTarefaId não está no form, mas faz parte do schema)
        // Criaremos um payload temporário para validar TUDO, incluindo o valor padrão (1) para statusTarefaId
        const payloadTemp: TarefaCreatePayload = {
            titulo: titulo.trim(),
            descricao: descricao.trim() || null,
            prazo: prazo ? new Date(prazo).toISOString() : null,
            projetoId: projetoId,
            assigneeId: assigneeId,
            statusTarefaId: 1, // Assume o valor que a API usará
        } as TarefaCreatePayload;


        for (const key of Object.keys(payloadTemp) as Array<keyof TarefaCreatePayload>) {
             newTouched[key] = true;
             
             let valueForValidation: any = payloadTemp[key];
             
             // Para validação, IDs 0 são tratados como null, exceto se a validação Zod for forçada
             if (typeof valueForValidation === 'string') {
                 valueForValidation = valueForValidation.trim();
             } 
             
             // Ignora null para campos opcionais na validação de preenchimento
             if (valueForValidation === 0 || valueForValidation === '' || valueForValidation === null) {
                 if (key === 'descricao' || key === 'prazo' || key === 'assigneeId') {
                     valueForValidation = null;
                 }
             }
             
             const error = validateField(tarefaCreateSchema, key, valueForValidation);
             if (error) newErrors[key] = error;
        }

        setTouched(newTouched);
        setErrors(newErrors);

        if (Object.keys(newErrors).some(key => newErrors[key] !== '')) { // Verifica se há algum erro real
            console.error("Erros de Validação que impedem a submissão:", newErrors); 
            return; 
        }

        setLoading(true);
        try {
            // 2. Constrói o PAYLOAD final (Note que statusTarefaId não é enviado)
            const payload: Omit<TarefaCreatePayload, 'statusTarefaId'> = {
                titulo: titulo.trim(),
                descricao: descricao.trim() || null, 
                prazo: prazo ? new Date(prazo).toISOString() : null, 
                projetoId: projetoId, 
                assigneeId: assigneeId,
            } as Omit<TarefaCreatePayload, 'statusTarefaId'>;
            
            // 3. Cria a tarefa
            const tarefa = await createTarefa(payload as TarefaCreatePayload);
            
            onTarefaCreated(tarefa); 
            handleClose();
        } catch (err) {
            console.error("Erro geral ao criar tarefa:", err);
        } finally {
            setLoading(false);
        }
    };
    
    // Cálculo do estado de erro
    const hasValidationErrors = useMemo(() => {
        return Object.values(errors).some(error => error !== '');
    }, [errors]);


    // --- RENDERIZAÇÃO (JSX) ---

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Cadastrar Nova Tarefa</DialogTitle>
            <DialogContent dividers>
                {loadingData ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4, mt: 2 }}>
                        <CircularProgress />
                        <Typography ml={2}>Carregando dados...</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        
                        {/* Campo: Título */}
                        <TextField 
                            fullWidth 
                            label="Título da Tarefa" 
                            value={titulo} 
                            onChange={(e) => handleInputChange("titulo", e.target.value)} 
                            onBlur={() => handleBlur("titulo")}
                            error={touched.titulo && !!errors.titulo}
                            helperText={touched.titulo && errors.titulo}
                        />
                        
                        {/* Campo: Projeto (Obrigatório) */}
                        <TextField
                            select
                            fullWidth
                            label="Projeto"
                            value={projetoId || ''}
                            onChange={(e) => handleInputChange("projetoId", Number(e.target.value))}
                            onBlur={() => handleBlur("projetoId")}
                            error={touched.projetoId && !!errors.projetoId}
                            helperText={touched.projetoId && errors.projetoId}
                            disabled={allProjetos.length === 0}
                        >
                            <MenuItem value={0} disabled>Selecione o projeto</MenuItem>
                            {allProjetos.map(projeto => (
                                <MenuItem key={projeto.id} value={projeto.id}>{projeto.nome}</MenuItem>
                            ))}
                        </TextField>
                        
                        {/* Campo: Responsável (Assignee - Opcional) */}
                        <TextField
                            select
                            fullWidth
                            label="Responsável (Assignee)"
                            value={assigneeId || ''} // Usa '' para campo não selecionado
                            onChange={(e) => handleInputChange("assigneeId", e.target.value === '' ? null : Number(e.target.value))}
                            onBlur={() => handleBlur("assigneeId")}
                            error={touched.assigneeId && !!errors.assigneeId}
                            helperText={touched.assigneeId && errors.assigneeId}
                        >
                             <MenuItem value={""}>Não Atribuído</MenuItem>
                            {allUsuarios.map(user => (
                                <MenuItem key={user.id} value={user.id}>{user.nome}</MenuItem>
                            ))}
                        </TextField>

                        {/* STATUS INICIAL REMOVIDO DO JSX */}
                        {/* A API se encarrega de setar o status para ID 1 (Pendente) */}


                        {/* Campo: Prazo (Opcional) */}
                        <TextField
                            fullWidth 
                            label="Prazo" 
                            type="date"
                            value={prazo} 
                            onChange={(e) => handleInputChange("prazo", e.target.value)}
                            onBlur={() => handleBlur("prazo")}
                            error={touched.prazo && !!errors.prazo}
                            helperText={touched.prazo && errors.prazo}
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* Campo: Descrição (Opcional) */}
                        <TextField 
                            fullWidth 
                            label="Descrição (Opcional)" 
                            multiline
                            rows={3}
                            value={descricao} 
                            onChange={(e) => handleInputChange("descricao", e.target.value)} 
                            onBlur={() => handleBlur("descricao")}
                            error={touched.descricao && !!errors.descricao}
                            helperText={touched.descricao && errors.descricao}
                        />

                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary"
                    disabled={loading || loadingData || hasValidationErrors} 
                >
                    {loading ? <CircularProgress size={24} /> : "Salvar Tarefa"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};