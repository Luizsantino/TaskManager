import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Chip,
    CircularProgress,
    Typography,
} from "@mui/material";
// Assumindo que o tipo ProjetoPayload agora é importado de um local unificado
import projetoService from "../../services/projetoService"; 
import userService from "../../services/userService"; 
import type { User } from "../../types/user";
import type { Projeto } from "../../types/projeto"; // Para tipar o retorno
import type { ProjetoPayload } from "../../types/projeto"; // Assumindo que você definirá este tipo aqui

// Interfaces de tipagem do componente
interface CriarProjetoModalProps {
    open: boolean;
    onClose: () => void;
    // Tipagem ajustada para o retorno do projeto
    onProjetoCreated: (projeto: Projeto) => void; 
}

// Interface para o estado inicial do formulário
interface FormData {
    nome: string;
    descricao: string;
    dataInicio: string;
    dataFimPrevista: string;
}

const initialFormData: FormData = {
    nome: "",
    descricao: "",
    dataInicio: "",
    dataFimPrevista: "",
};


export const CriarProjetoModal = ({ open, onClose, onProjetoCreated }: CriarProjetoModalProps) => {
    
    // Estados do Formulário
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [usuariosSelecionados, setUsuariosSelecionados] = useState<number[]>([]);
    
    // Estados de Dados e Processamento
    const [allUsuarios, setAllUsuarios] = useState<User[]>([]);
    const [loading, setLoading] = useState(false); // Para submissão
    const [loadingData, setLoadingData] = useState(false); // Para carregar usuários

    const { nome, descricao, dataInicio, dataFimPrevista } = formData;

    // Função para buscar dados (usuários)
    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            const usuariosData = await userService.getUsers();
            setAllUsuarios(usuariosData);
        } catch (err) {
            console.error("Erro ao buscar usuários:", err);
            // Em um app real, você adicionaria um Snackbar de erro aqui
        } finally {
            setLoadingData(false);
        }
    }, []);

    // Efeito para carregar usuários e resetar o formulário quando o modal abre
    useEffect(() => {
        if (open) {
            loadData();
            // Resetar formulário ao abrir (caso a submissão anterior tenha falhado ou o modal tenha sido fechado de forma incorreta)
            setFormData(initialFormData);
            setUsuariosSelecionados([]);
        }
    }, [open, loadData]);

    // Função para limpar e fechar o modal
    const handleClose = () => {
        setFormData(initialFormData);
        setUsuariosSelecionados([]);
        setLoading(false);
        onClose();
    };
    
    // Handler para mudanças nos campos de texto
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handler para o multi-select de usuários
    const handleUsuariosChange = (event: any) => {
        const { target: { value } } = event;
        // value pode ser um array de IDs ou uma string de IDs (dependendo da implementação)
        const selectedIds = typeof value === 'string' ? value.split(',').map(Number) : value;
        setUsuariosSelecionados(selectedIds);
    };

    const handleSubmit = async () => {
        // Implementar validação simples aqui (ex: verificar se nome está preenchido)
        if (!nome || !dataInicio || !dataFimPrevista) {
            alert("Por favor, preencha Nome, Data Início e Data Fim Prevista.");
            return;
        }

        setLoading(true);
        try {
            const payload: ProjetoPayload = {
                nome,
                descricao, // Pode ser null ou string
                dataInicio: new Date(dataInicio).toISOString(),
                dataFimPrevista: new Date(dataFimPrevista).toISOString(),
                // Se ProjetoPayload exigir statusId, você deve adicioná-lo aqui
            };
    
            const projeto = await projetoService.createProjeto(payload);
    
            // Vincula os usuários (opcional)
            for (const userId of usuariosSelecionados) {
                // Não precisa de try/catch individualmente, o erro é mais geral
                await projetoService.addUsuarioToProjeto(projeto.id, userId);
            }
    
            onProjetoCreated(projeto);
            handleClose();
        } catch (err: any) {
            console.error("Erro ao criar projeto:", err);
            // Mostrar erro no Snackbar do componente pai, se possível
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Cadastrar Novo Projeto</DialogTitle>
            <DialogContent dividers>
                {loadingData ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4, mt: 2 }}>
                        <CircularProgress />
                        <Typography ml={2}>Carregando dados...</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField 
                            fullWidth 
                            label="Nome" 
                            value={nome} 
                            onChange={(e) => handleInputChange("nome", e.target.value)} 
                        />
                        <TextField 
                            fullWidth 
                            label="Descrição" 
                            multiline
                            rows={3}
                            value={descricao} 
                            onChange={(e) => handleInputChange("descricao", e.target.value)} 
                        />
                        <TextField
                            fullWidth 
                            label="Data Início" 
                            type="date"
                            value={dataInicio} 
                            onChange={(e) => handleInputChange("dataInicio", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth 
                            label="Data Fim Prevista" 
                            type="date"
                            value={dataFimPrevista} 
                            onChange={(e) => handleInputChange("dataFimPrevista", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* Multi-select de usuários */}
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
                    disabled={loading || loadingData || !nome || !dataInicio || !dataFimPrevista}
                >
                    {loading ? <CircularProgress size={24} /> : "Salvar Projeto"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default CriarProjetoModal;