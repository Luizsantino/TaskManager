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
// Imports de Projetos
import { CriarProjetoModal } from "../components/projetos/CriarProjetoModal";
import { EditarProjetoModal } from "../components/projetos/EditarProjetoModal";
import {
    getProjetos,
    createProjeto,
    updateProjeto,
    deleteProjeto,
} from "../services/projetoService";
import type { Projeto } from "../types/projeto";
import { getTarefas } from "../services/tarefaService";
import { useDebounce } from "../hooks/useDebounce";

// *** Componente de Tabela Mock, pois o original estava faltando ***
// Em um projeto real, você importaria este componente.
const ProjetosTable = ({ projetos, deletingId, onDelete, onEdit, loading }: any) => {
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (projetos.length === 0) {
        return (
            <Typography variant="subtitle1" color="text.secondary" textAlign="center" py={4}>
                Nenhum projeto encontrado.
            </Typography>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" mb={2}>Lista de Projetos ({projetos.length})</Typography>
                {/* Implementação da tabela deve ir aqui */}
                {projetos.map((projeto: Projeto) => (
                    <Box key={projeto.id} display="flex" justifyContent="space-between" alignItems="center" p={1} borderBottom="1px solid #eee">
                        <Typography>{projeto.nome}</Typography>
                        <Box>
                            <Button onClick={() => onEdit(projeto)} size="small">Editar</Button>
                            <Button 
                                onClick={() => onDelete(projeto.id)} 
                                color="error" 
                                size="small"
                                disabled={deletingId === projeto.id}
                            >
                                {deletingId === projeto.id ? <CircularProgress size={18} /> : "Excluir"}
                            </Button>
                        </Box>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
};
// *** Fim do Componente de Tabela Mock ***


type SnackbarState = {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
};

// 1. Componente renomeado de ConsultasPage para ProjetosPage
export const ProjetosPage = () => {
    const navigate = useNavigate();
    // 2. Variável de estado mantida como Projetos (com P maiúsculo, conforme o original)
    const [Projetos, setProjetos] = useState<Projeto[]>([]); 
    const [loading, setLoading] = useState(true);
    const [modalCriarOpen, setModalCriarOpen] = useState(false);
    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [projetoSelecionado, setProjetoSelecionado] =
      useState<Projeto | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filtroData, setFiltroData] = useState(""); // Filtro por período de data de início
    const [snackbar, setSnackbar] = useState<SnackbarState>({
      open: false,
      message: "",
      severity: "info",
    });

    const carregarProjetos = useCallback(async () => {
        setLoading(true);
        try {
          const data = await getProjetos();
          setProjetos(data);
        } catch (error) {
          console.error("Erro ao carregar projetos:", error);
          setSnackbar({
            open: true,
            message: "Erro ao buscar projetos.",
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      }, []);

    useEffect(() => {
        carregarProjetos();
    }, [carregarProjetos]);

    // 3. Função de exclusão corrigida (setProjeto para setProjetos)
    const handleDelete = useCallback(async (id: number) => {
        setDeletingId(id);
    
        try {
          await deleteProjeto(id);
          setProjetos((prev) => prev.filter((c) => c.id !== id));
          setSnackbar({
            open: true,
            message: "Projeto deletado com sucesso.",
            severity: "success",
          });
        } catch (error) {
          console.error("Erro ao excluir projeto:", error);
          setSnackbar({
            open: true,
            message: "Erro ao deletar projeto.",
            severity: "error",
          });
        } finally {
          setDeletingId(null);
        }
      }, []);
    
      const handleOpenEditModal = useCallback((projeto: Projeto) => {
        setProjetoSelecionado(projeto);
        setModalEditarOpen(true);
      }, []);

      const handleCloseEditModal = useCallback(() => {
        setProjetoSelecionado(null);
        setModalEditarOpen(false);
      }, []);

      const handleSaveEdit = useCallback(
        // Ajustando a tipagem de dados, pois o modal envia Partial<ProjetoFormData>
        async (id: number, dados: any) => { 
          try {
            // updateProjeto espera ProjetoPayload, que é mais restrito que Partial<Projeto>
            // mas para simplificar, usaremos o tipo mais amplo (any ou o tipo correto do modal)
            await updateProjeto(id, dados); 
            await carregarProjetos();
            setSnackbar({
              open: true,
              message: "Projeto atualizado com sucesso.",
              severity: "success",
            });
          } catch (error) {
            console.error("Erro ao atualizar projeto:", error);
            setSnackbar({
              open: true,
              message: "Erro ao atualizar projeto.",
              severity: "error",
            });
            throw error;
          }
        },
        [carregarProjetos]
      );

    // 4. Nova função para lidar com o sucesso na criação do projeto
    const handleSucessoCriarProjeto = useCallback(async () => {
        setModalCriarOpen(false);
        await carregarProjetos();
        setSnackbar({
            open: true,
            message: "Projeto cadastrado com sucesso!",
            severity: "success",
        });
    }, [carregarProjetos]);

    // Variável debounced já estava definida corretamente
    const debouncedSerachTerm = useDebounce(searchTerm, 300);

    // 5. useMemo corrigido (de useNemo para useMemo e dependências/variáveis)
    const projetosFiltrados = useMemo(() => {
        let resultado = [...Projetos]; // Usando Projetos (estado)

        // Filtro de busca por texto
        if(debouncedSerachTerm.trim()) {
            const termoBusca = debouncedSerachTerm.toLowerCase();
            resultado = resultado.filter((projeto) => {
                return (
                    projeto.nome.toLowerCase().includes(termoBusca) ||
                    projeto.descricao?.toLowerCase().includes(termoBusca) // Incluindo busca por descrição
                );
            });
        }
        
        // filtro por periodo de data
        if (filtroData) {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            resultado = resultado.filter((projeto) => {
                const dataInicio = new Date(projeto.dataInicio);
                dataInicio.setHours(0, 0, 0, 0); // Zera hora para comparação de datas

                switch (filtroData) {
                    case "hoje": {
                        // Compara apenas a data
                        return dataInicio.getTime() === hoje.getTime(); 
                    }
                    case "semana": {
                        const semanaFutura = new Date(hoje);
                        semanaFutura.setDate(hoje.getDate() + 7);
                        return dataInicio >= hoje && dataInicio <= semanaFutura;
                    }
                    case "mes": {
                        return dataInicio.getFullYear() === hoje.getFullYear() && dataInicio.getMonth() === hoje.getMonth();
                    }
                    case "futuras": {
                        return dataInicio > hoje;
                    }
                    case "passadas": {
                        return dataInicio < hoje;
                    }
                    default:
                        return true;
                }
            });
        }
        return resultado;
    // 6. Dependências do useMemo corrigidas para Projetos
    }, [Projetos, debouncedSerachTerm, filtroData]);

    // *** INÍCIO DO RETORNO (JSX) CORRIGIDO ***
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

                {/* 7. Título corrigido */}
                <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
                    Gerenciar Projetos
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
                            // 8. Placeholder de busca corrigido
                            placeholder="Buscar por nome ou descrição do projeto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ // Correção da prop slotProps para InputProps
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
                            label="Filtrar por período"
                            value={filtroData}
                            onChange={(e) => setFiltroData(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="">Todas as Datas</MenuItem>
                            <MenuItem value="hoje">Iniciando Hoje</MenuItem>
                            <MenuItem value="semana">Próximos 7 dias</MenuItem>
                            <MenuItem value="mes">Este mês</MenuItem>
                            <MenuItem value="futuras">Futuras</MenuItem>
                            <MenuItem value="passadas">Passadas</MenuItem>
                        </TextField>
                    </Box>
                </Box>

                {(debouncedSerachTerm || filtroData) && (
                    <Box mb={2} display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                            Resultados encontrados:
                        </Typography>
                        <Chip
                            // 9. Variável de contagem corrigida
                            label={projetosFiltrados.length} 
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                        {/* 10. Variável de comparação corrigida */}
                        {projetosFiltrados.length !== Projetos.length && (
                            <Typography variant="body2" color="text.secondary">
                                de {Projetos.length} total
                            </Typography>
                        )}
                    </Box>
                )}

                {/* 11. Componente da Tabela de Projetos */}
                <ProjetosTable // Renomeado de ConsultasTable
                    projetos={projetosFiltrados} // Variável corrigida
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
                        {/* 12. Label do botão corrigida */}
                        Cadastrar Novo Projeto 
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

            {/* 13. Modal de Criação corrigido (Nome e Prop) */}
            <CriarProjetoModal // Renomeado de CriarConsultaModal
                open={modalCriarOpen}
                onClose={() => setModalCriarOpen(false)}
                onSave={handleSucessoCriarProjeto} // Função corrigida
            />

            {/* 14. Modal de Edição corrigido (Nome e Prop) */}
            <EditarProjetoModal // Renomeado de EditarConsultaModal
                open={modalEditarOpen}
                onClose={handleCloseEditModal}
                onSave={handleSaveEdit}
                projeto={projetoSelecionado} // Variável corrigida
            />
        </Box>