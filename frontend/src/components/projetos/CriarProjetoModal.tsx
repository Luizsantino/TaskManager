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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Chip,
    Typography,
} from "@mui/material";

// Importações de serviços e tipos
import projetoService from "../../services/projetoService"; 
import userService from "../../services/userService"; 
import type { User } from "../../types/user";
import type { Projeto } from "../../types/projeto"; 
import type { ProjetoPayload } from "../../types/projeto"; // Certifique-se de que este tipo aceita 'membrosIds'

// Importação dos schemas de validação
import { projetoSchema } from "../../schemas/projetoSchema"; 
import { validateField } from "../../schemas/validation";


// --- Interfaces e Estados Iniciais ---

interface FormData {
    nome: string;
    descricao: string;
    dataInicio: string; // YYYY-MM-DD
    dataFimPrevista: string; // YYYY-MM-DD
}

const initialFormData: FormData = {
    nome: "",
    descricao: "",
    dataInicio: "",
    dataFimPrevista: "",
};


interface CriarProjetoModalProps {
    open: boolean;
    onClose: () => void;
    onProjetoCreated: (projeto: Projeto) => void; 
}


export const CriarProjetoModal = ({
    open,
    onClose,
    onProjetoCreated,
}: CriarProjetoModalProps) => {
    
    // Estados
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [usuariosSelecionados, setUsuariosSelecionados] = useState<number[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [allUsuarios, setAllUsuarios] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    const { nome, descricao, dataInicio, dataFimPrevista } = formData;
    
    // --- Funções de Dados e Setup ---

    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            const usuariosData = await userService.getUsers();
            setAllUsuarios(usuariosData);
        } catch (err) {
            console.error("Erro ao buscar usuários:", err);
        } finally {
            setLoadingData(false);
        }
    }, []);
    
    const handleClose = () => {
        setFormData(initialFormData);
        setUsuariosSelecionados([]);
        setErrors({});
        setTouched({});
        setLoading(false);
        onClose();
    };

    useEffect(() => {
        if (open) {
            setFormData(initialFormData);
            setUsuariosSelecionados([]);
            setErrors({});
            setTouched({});
            loadData();
        }
    }, [open, loadData]); 

    // --- Funções de Validação e Input ---

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (touched[field]) {
            const error = validateField(projetoSchema, field, value); 
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };
    
    const handleBlur = (field: keyof FormData) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const value = formData[field];
        const error = validateField(projetoSchema, field, value); 
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleUsuariosChange = (event: any) => {
        const { target: { value } } = event;
        const selectedIds = typeof value === 'string' ? value.split(',').map(Number) : value;
        setUsuariosSelecionados(selectedIds);
    };


    // --- Função de Submissão ---

    const handleSubmit = async () => {
        
        const newTouched: Record<string, boolean> = {};
        const newErrors: Record<string, string> = {};

        // ... (Lógica de validação) ...
        for (const key of Object.keys(formData) as Array<keyof FormData>) {
             newTouched[key] = true;
             const valueForValidation = (key === 'nome' || key === 'descricao') ? formData[key].trim() : formData[key];
             const error = validateField(projetoSchema, key, valueForValidation);
             if (error) newErrors[key] = error;
        }

        setTouched(newTouched);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            console.error("Erros de Validação que impedem a submissão:", newErrors); 
            return; 
        }

        setLoading(true);
        try {
            // 1. Constrói o PAYLOAD, INCLUINDO o array de IDs
            const payload: ProjetoPayload = {
                nome: formData.nome.trim(), 
                descricao: formData.descricao.trim(), 
                dataInicio: new Date(formData.dataInicio).toISOString(), 
                dataFimPrevista: new Date(formData.dataFimPrevista).toISOString(), 
                
                // NOVO: Adiciona a lista de IDs de membros ao payload
                membrosIds: usuariosSelecionados.length > 0 ? usuariosSelecionados : undefined,
                
                // NOTA: Se ProjetoPayload não incluir 'membrosIds', isso causará um erro de tipagem.
                // Você deve garantir que 'ProjetoPayload' em types/projeto.ts foi atualizado.
            } as ProjetoPayload; 
            
            // 2. Cria o projeto, vinculando os usuários na mesma transação no backend
            const projeto = await projetoService.createProjeto(payload);
            
            // 3. REMOVIDO: O loop de chamadas addUsuarioToProjeto foi removido
            // pois a vinculação é feita pelo backend na etapa 2.

            onProjetoCreated(projeto); 
            handleClose();
        } catch (err) {
            console.error("Erro geral ao criar projeto:", err);
            // Em um sistema real, você exibiria uma mensagem de erro global.
        } finally {
            setLoading(false);
        }
    };
    
    // Cálculo do estado de erro
    const hasValidationErrors = useMemo(() => {
        return Object.values(errors).some(error => error !== '');
    }, [errors]);


    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Cadastrar Novo Projeto</DialogTitle>
            <DialogContent dividers>
                {loadingData ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4, mt: 2 }}>
                        <CircularProgress />
                        <Typography ml={2}>Carregando membros da equipe...</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        
                        {/* Campos de Projeto */}
                        <TextField 
                            fullWidth label="Nome" value={nome} onChange={(e) => handleInputChange("nome", e.target.value)} onBlur={() => handleBlur("nome")} error={touched.nome && !!errors.nome} helperText={touched.nome && errors.nome}
                        />
                        <TextField 
                            fullWidth label="Descrição" multiline rows={3} value={descricao} onChange={(e) => handleInputChange("descricao", e.target.value)} onBlur={() => handleBlur("descricao")} error={touched.descricao && !!errors.descricao} helperText={touched.descricao && errors.descricao}
                        />
                        <TextField
                            fullWidth label="Data Início" type="date" value={dataInicio} onChange={(e) => handleInputChange("dataInicio", e.target.value)} onBlur={() => handleBlur("dataInicio")} error={touched.dataInicio && !!errors.dataInicio} helperText={touched.dataInicio && errors.dataInicio} InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth label="Data Fim Prevista" type="date" value={dataFimPrevista} onChange={(e) => handleInputChange("dataFimPrevista", e.target.value)} onBlur={() => handleBlur("dataFimPrevista")} error={touched.dataFimPrevista && !!errors.dataFimPrevista} helperText={touched.dataFimPrevista && errors.dataFimPrevista} InputLabelProps={{ shrink: true }}
                        />

                        {/* Multi-select de usuários (Membros da Equipe) */}
                        <FormControl fullWidth>
                            <InputLabel id="usuarios-label">Membros da Equipe (Opcional)</InputLabel>
                            <Select
                                labelId="usuarios-label"
                                multiple
                                value={usuariosSelecionados}
                                onChange={handleUsuariosChange}
                                input={<OutlinedInput label="Membros da Equipe (Opcional)" />}
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
                <Button onClick={handleClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary"
                    disabled={loading || loadingData || hasValidationErrors} 
                >
                    {loading ? <CircularProgress size={24} /> : "Salvar Projeto"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};