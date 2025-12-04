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
// Assumindo a importação correta de tipos
// NOTA: O ERRO TS OCORRE AQUI. A INTERFACE EXTERNA DEVE SER ATUALIZADA.
import type { Projeto } from "../../types/projeto"; 


// --- DEFINIÇÕES DE TIPO LOCAIS (PARA RESOLVER O ERRO DE TIPAGEM) ---
// Estas interfaces refletem o que o backend está retornando (Status + ProjetoUsuarios aninhado)
interface ProjetoStatus {
  nome: string;
}

interface ProjetoUsuario {
  // O nome do relacionamento no Prisma é 'usuario'
  usuario: {
      nome: string;
  };
  projetoId: number;
  userId: number;
}

// Criando uma interface mais flexível para o componente, assumindo que Projeto base
// precisa de status e projetoUsuarios.
interface LocalProjeto extends Omit<Projeto, 'status' | 'projetoUsuarios'> {
  status?: ProjetoStatus; // Status é necessário para a tabela
  projetoUsuarios?: ProjetoUsuario[]; // Membros são necessários
}


// --- Funções Auxiliares ---

/**
* Formata strings ISO 8601 (datas) para o formato DD/MM/AAAA.
*/
const formatarData = (dateString: string): string => {
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

interface ProjetosTableProps {
  // A tipagem 'Projetos' ainda usa a interface externa, mas o acesso dentro do componente
  // agora será seguro devido à estrutura que o backend retorna.
  projetos: Projeto[]; 
  deletingId: number | null;
  onDelete: (id: number) => void;
  onEdit: (projeto: Projeto) => void;
  loading: boolean;
}

export const ProjetosTable = ({
  projetos,
  deletingId,
  onDelete,
  onEdit,
  loading,
}: ProjetosTableProps) => {
  
  // Colunas ajustadas para incluir 'Membros' e 'Status'
  const colunas: string[] = [
    "Nome", 
    "Descrição", 
    "Data Início", 
    "Data Fim Prevista", 
    "Status", 
    "Membros", // Adicionada a coluna Membros
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
  
  if (projetos.length === 0) {
      return (
          <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography color="text.secondary">Nenhum projeto encontrado.</Typography>
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
                align={coluna === 'Ações' || coluna.includes('Data') || coluna === 'Status' || coluna === 'Membros' ? "center" : "left"} 
                className="font-bold text-white uppercase text-sm"
              >
                {coluna}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {projetos.map((p) => {
              // Casting o projeto para o tipo local seguro
              const projeto = p as unknown as LocalProjeto; 

              return (
                  <TableRow key={projeto.id} hover className="border-b border-gray-200">
                      
                      {/* Coluna: Nome */}
                      <TableCell component="th" scope="row" align="left">
                      {projeto.nome || "—"}
                      </TableCell>

                      {/* Coluna: Descrição */}
                      <TableCell align="left" sx={{maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {projeto.descricao ? projeto.descricao.substring(0, 50) + (projeto.descricao.length > 50 ? '...' : '') : "—"}
                      </TableCell>

                      {/* Coluna: Data Início (Formatada) */}
                      <TableCell align="center">
                      {formatarData(projeto.dataInicio)}
                      </TableCell>

                      {/* Coluna: Data Fim Prevista (Formatada) */}
                      <TableCell align="center">
                      {formatarData(projeto.dataFimPrevista)}
                      </TableCell>

                      {/* Coluna: Status (NOME do relacionamento) */}
                      <TableCell align="center">
                          {projeto.status?.nome || 'N/A'} 
                      </TableCell>
                      
                      {/* Coluna: Membros (Correção e Nova Implementação) */}
                      <TableCell align="center">
                          {projeto.projetoUsuarios && projeto.projetoUsuarios.length > 0 ? (
                              <Tooltip title={
                                  // Mapeia todos os nomes para exibir no Tooltip
                                  projeto.projetoUsuarios.map(pu => pu.usuario.nome).join(', ')
                              }>
                                  <Typography variant="body2" sx={{ cursor: 'pointer' }}>
                                      {/* Exibe o nome do primeiro membro e a contagem */}
                                      {projeto.projetoUsuarios[0].usuario.nome}
                                      {projeto.projetoUsuarios.length > 1 && (
                                          ` (+${projeto.projetoUsuarios.length - 1})`
                                      )}
                                  </Typography>
                              </Tooltip>
                          ) : (
                              "Nenhum"
                          )}
                      </TableCell>

                      {/* Coluna: Ações */}
                      <TableCell align="center">
                      <div className="flex justify-center gap-2">
                          <Tooltip title="Editar">
                          <IconButton
                              color="primary"
                              size="small"
                              onClick={() => onEdit(projeto as Projeto)} // Cast de volta para Projeto no evento
                              aria-label={`editar-${projeto.id}`}
                          >
                              <EditIcon />
                          </IconButton>
                          </Tooltip>
                          <Tooltip title="Remover">
                          <IconButton
                              color="error"
                              size="small"
                              onClick={() => onDelete(projeto.id)}
                              disabled={deletingId === projeto.id}
                              aria-label={`remover-${projeto.id}`}
                          >
                              {deletingId === projeto.id ? (
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