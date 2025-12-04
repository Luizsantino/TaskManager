import { useEffect, useState, useCallback, useMemo } from "react";
import {
    Button,
    Typography,
    Snackbar,
    Alert,
    Box,
    Paper,
    IconButton,
    TextField,
    InputAdornment,
    MenuItem,
    Chip,
    CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

// Imports de Tarefas e Serviços
import { TarefaTable } from "../components/tarefas/TarefaTable";
import { CriarTarefaModal } from "../components/tarefas/CriarTarefaModal";
import { EditarTarefaModal } from "../components/tarefas/EditarTarefaModal"; 
import {
    getTarefas,
    updateTarefa, 
    deleteTarefa,
} from "../services/tarefaService";
import type { Tarefa } from "../types/tarefa";
// CORREÇÃO 1: Importando o tipo Projeto para uso na tipagem com relacionamentos
import type { Projeto } from "../types/projeto"; 
import { useDebounce } from "../hooks/useDebounce";

// Tipagem local da Tarefa Com Relacionamentos (Copiada do TarefaTable para consistência)
// CORREÇÃO 1: Tornando o campo 'projeto' opcional para resolver a incompatibilidade TS2719
interface TarefaComRelacoes extends Tarefa {
    assignee?: { nome: string } | null;
    statusTarefa?: { nome: string };
    projeto?: Projeto; // AGORA OPCIONAL
}


type SnackbarState = {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
};

// Componente principal renomeado para TarefasPage
export const TarefasPage = () => {
    const navigate = useNavigate();
    // CORREÇÃO 2: Variável de estado da lista deve usar TarefaComRelacoes
    const [Tarefas, setTarefas] = useState<TarefaComRelacoes[]>([]); 
    const [loading, setLoading] = useState(true);
    const [modalCriarOpen, setModalCriarOpen] = useState(false);
    
    // CORREÇÃO 3: Estados de edição devem usar TarefaComRelacoes
    const [modalEditarOpen, setModalEditarOpen] = useState(false); 
    const [tarefaSelecionada, setTarefaSelecionada] = useState<TarefaComRelacoes | null>(null); 
    
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filtroStatus, setFiltroStatus] = useState(""); // Filtro por Status
    const [snackbar, setSnackbar] = useState<SnackbarState>({
      open: false,
      message: "",
      severity: "info",
    });

    // Função para carregar tarefas
    const carregarTarefas = useCallback(async () => {
        setLoading(true);
        try {
          // O retorno de getTarefas é castado para o tipo com relacionamentos
          const data = await getTarefas();
          setTarefas(data as TarefaComRelacoes[]);
        } catch (error) {
          console.error("Erro ao carregar tarefas:", error);
          setSnackbar({
            open: true,
            message: "Erro ao buscar tarefas.",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      }, []);

    useEffect(() => {
        carregarTarefas();
    }, [carregarTarefas]);

    // Função de exclusão
    const handleDelete = useCallback(async (id: number) => {
        setDeletingId(id);
    
        try {
          await deleteTarefa(id);
          // Atualiza a lista removendo a tarefa deletada
          setTarefas((prev) => prev.filter((c) => c.id !== id) as TarefaComRelacoes[]);
          setSnackbar({
            open: true,
            message: "Tarefa deletada com sucesso.",
            severity: "success",
          });
        } catch (error) {
          console.error("Erro ao excluir tarefa:", error);
          setSnackbar({
            open: true,
            message: "Erro ao deletar tarefa.",
            severity: "error",
          });
        } finally {
          setDeletingId(null);
        }
      }, []);
    
    // Funções de Edição (Corrigidas para usar TarefaComRelacoes)
    const handleOpenEditModal = useCallback((tarefa: TarefaComRelacoes) => {
        setTarefaSelecionada(tarefa);
        setModalEditarOpen(true);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setTarefaSelecionada(null);
        setModalEditarOpen(false);
    }, []);

    const handleSaveEdit = useCallback(
        async (id: number, dados: any) => { 
            await updateTarefa(id, dados); 
            await carregarTarefas();
            setSnackbar({
                open: true,
                message: "Tarefa atualizada com sucesso.",
                severity: "success",
            });
        },
        [carregarTarefas]
    );

    // Função para lidar com o sucesso na criação da tarefa
    const handleSucessoCriarTarefa = useCallback(async () => {
        setModalCriarOpen(false);
        await carregarTarefas();
        setSnackbar({
            open: true,
            message: "Tarefa cadastrada com sucesso!",
            severity: "success",
        });
    }, [carregarTarefas]);

    // Variável debounced
    const debouncedSerachTerm = useDebounce(searchTerm, 300);

    // Lógica de Filtro
    const tarefasFiltradas = useMemo(() => {
        let resultado = [...Tarefas]; 

        // 1. Filtro de busca por texto (título ou descrição)
        if(debouncedSerachTerm.trim()) {
            const termoBusca = debouncedSerachTerm.toLowerCase();
            resultado = resultado.filter((tarefa) => {
                return (
                    tarefa.titulo.toLowerCase().includes(termoBusca) ||
                    tarefa.descricao?.toLowerCase().includes(termoBusca) 
                );
            });
        }
        
        // 2. Filtro por Status (usa o ID do status)
        if (filtroStatus) {
            const statusId = Number(filtroStatus);
            resultado = resultado.filter((tarefa) => tarefa.statusTarefaId === statusId);
        }

        return resultado;
    }, [Tarefas, debouncedSerachTerm, filtroStatus]);

    // --- RETORNO (JSX) ---
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            minHeight="100vh"
            bgcolor="background.default"
            p={3}
        >
            <Paper
                elevation={3}
                sx={(theme) => ({
                    width: "100%",
                    maxWidth: 1400,
                    p: 3,
                    position: "relative",
                    bgcolor:
                        theme.palette.mode === "dark" ? "#242424" : "background.paper",
                    color: theme.palette.text.primary,
                    borderRadius: 2,
                })}
            >
                <IconButton
                    aria-label="voltar"
                    onClick={() => navigate("/home")}
                    size="small"
                    sx={{ position: "absolute", left: 16, top: 16 }}
                >
                    <ArrowBackIcon fontSize="small" />
                </IconButton>

                <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
                    Gerenciar Tarefas
                </Typography>

                <Box
                    display="flex"
                    gap={2}
                    mb={3}
                    flexDirection={{ xs: "column", md: "row" }}
                >
                    <Box flex={1}>
                        <TextField
                            fullWidth
                            placeholder="Buscar por título ou descrição da tarefa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ 
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                    </Box>
                    <Box width={{ xs: "100%", md: 300 }}>
                        <TextField
                            select
                            fullWidth
                            label="Filtrar por Status"
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="">Todos os Status</MenuItem>
                            {/* NOTE: Em um projeto completo, você carregaria a lista de StatusTarefa aqui */}
                            <MenuItem value={1}>Pendente</MenuItem>
                            <MenuItem value={2}>Em Andamento</MenuItem>
                            <MenuItem value={3}>Concluída</MenuItem>
                        </TextField>
                    </Box>
                </Box>

                {(debouncedSerachTerm || filtroStatus) && (
                    <Box mb={2} display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                            Resultados encontrados:
                        </Typography>
                        <Chip
                            label={tarefasFiltradas.length} 
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                        {tarefasFiltradas.length !== Tarefas.length && (
                            <Typography variant="body2" color="text.secondary">
                                de {Tarefas.length} total
                            </Typography>
                        )}
                    </Box>
                )}

                <TarefaTable // Componente de Tabela de Tarefas
                    tarefas={tarefasFiltradas} 
                    deletingId={deletingId}
                    onDelete={handleDelete}
                    onEdit={handleOpenEditModal}
                    loading={loading}
                />

                <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        color="primary"
                        className="uppercase font-bold"
                        onClick={() => setModalCriarOpen(true)}
                    >
                        Cadastrar Nova Tarefa 
                    </Button>
                </Box>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                    <Alert
                        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                        severity={snackbar.severity}
                        sx={{ width: "100%" }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Paper>

            <CriarTarefaModal
                open={modalCriarOpen}
                onClose={() => setModalCriarOpen(false)}
                onTarefaCreated={handleSucessoCriarTarefa}
            />

            {/* Modal de Edição Ativado */}
            <EditarTarefaModal
                open={modalEditarOpen}
                onClose={handleCloseEditModal}
                onSave={handleSaveEdit}
                tarefa={tarefaSelecionada}
            />
            
        </Box>
    );
};