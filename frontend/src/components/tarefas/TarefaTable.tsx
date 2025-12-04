import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    IconButton, 
    Tooltip, 
    CircularProgress, 
    Box, 
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

// Importação do tipo base Tarefa (Este tipo deve ser atualizado para incluir os relacionamentos!)
import type { Tarefa } from "../../types/tarefa"; 


// --- TIPOS CORRIGIDOS E LOCAIS (Garantem que a estrutura do backend seja conhecida) ---
interface StatusTarefa {
    nome: string;
}

interface TarefaAssignee {
    nome: string;
}

/**
 * Interface que representa a estrutura de dados que *realmente* vem da API (com includes).
 * Usada para tipar o array 'tarefas' na prop.
 */
interface TarefaComRelacoes extends Tarefa {
    assignee?: TarefaAssignee | null; 
    statusTarefa?: StatusTarefa; 
}


// --- Funções Auxiliares ---

/**
 * Formata strings ISO 8601 (datas) para o formato DD/MM/AAAA.
 */
const formatarData = (dateString: string | null): string => {
    if (!dateString) return "—";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Data Inválida"; 
        return date.toLocaleDateString('pt-BR');
    } catch {
        return "Data Inválida";
    }
};

// --- Componente Principal ---

interface TarefasTableProps {
    // CORREÇÃO 1: Usar a interface que inclui as relações na prop para garantir que os dados cheguem
    tarefas: TarefaComRelacoes[]; 
    deletingId: number | null;
    onDelete: (id: number) => void;
    // CORREÇÃO 2: onEdit agora aceita o tipo completo (TarefaComRelacoes)
    onEdit: (tarefa: TarefaComRelacoes) => void; 
    loading: boolean;
}

export const TarefaTable = ({
    tarefas,
    deletingId,
    onDelete,
    onEdit,
    loading,
}: TarefasTableProps) => {
    
    // Colunas ajustadas para refletir a entidade Tarefa
    const colunas: string[] = [
      "Status",
      "Título", 
      "Descrição", 
      "Prazo", 
      "Responsável", 
      "Ações"
    ];

    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    
    if (tarefas.length === 0) {
        return (
            <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography color="text.secondary">Nenhuma tarefa encontrada.</Typography>
            </Box>
        );
    }


    return (
      <TableContainer className="mt-4 rounded-lg shadow-lg">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-800">
              {colunas.map((coluna) => (
                <TableCell
                  key={coluna}
                  align={coluna === 'Ações' || coluna === 'Status' || coluna === 'Prazo' || coluna === 'Responsável' ? "center" : "left"} 
                  className="font-bold text-white uppercase text-sm"
                >
                  {coluna}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tarefas.map((tarefa) => { 
                
                return (
                    <TableRow key={tarefa.id} hover className="border-b border-gray-200">
                        
                        {/* Coluna: Status de Conclusão */}
                        <TableCell align="center">
                            <Tooltip title={tarefa.concluida ? "Concluída" : "Pendente"}>
                                {tarefa.concluida ? (
                                    <CheckCircleIcon color="success" />
                                ) : (
                                    <RadioButtonUncheckedIcon color="disabled" />
                                )}
                            </Tooltip>
                        </TableCell>
                        
                        {/* Coluna: Título */}
                        <TableCell component="th" scope="row" align="left">
                            <Box sx={{ fontWeight: 'bold' }}>
                                {tarefa.titulo || "—"}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Status: {tarefa.statusTarefa?.nome || 'N/A'}
                            </Typography>
                        </TableCell>

                        {/* Coluna: Descrição */}
                        <TableCell align="left" sx={{maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {tarefa.descricao ? tarefa.descricao.substring(0, 50) + (tarefa.descricao.length > 50 ? '...' : '') : "—"}
                        </TableCell>

                        {/* Coluna: Prazo (Formatada) */}
                        <TableCell align="center">
                            {formatarData(tarefa.prazo)}
                        </TableCell>
                        
                        {/* Coluna: Responsável (Assignee Name) */}
                        <TableCell align="center">
                            {tarefa.assignee?.nome || 'Não Atribuído'}
                        </TableCell>

                        {/* Coluna: Ações */}
                        <TableCell align="center">
                        <div className="flex justify-center gap-2">
                            <Tooltip title="Editar">
                            <IconButton
                                color="primary"
                                size="small"
                                onClick={() => onEdit(tarefa)} 
                                aria-label={`editar-${tarefa.id}`}
                            >
                                <EditIcon />
                            </IconButton>
                            </Tooltip>
                            <Tooltip title="Remover">
                            <IconButton
                                color="error"
                                size="small"
                                onClick={() => onDelete(tarefa.id)}
                                disabled={deletingId === tarefa.id}
                                aria-label={`remover-${tarefa.id}`}
                            >
                                {deletingId === tarefa.id ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    <DeleteIcon />
                                )}
                            </IconButton>
                            </Tooltip>
                        </div>
                        </TableCell>
                    </TableRow>
                );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
};