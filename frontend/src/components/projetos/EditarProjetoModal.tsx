import { useState, useEffect } from "react";
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
} from "@mui/material";
import { projetoUpdateSchema } from "../../schemas/projetoSchema";
import { validateField } from "../../schemas/validation";
import type { Projeto } from "../../types/projeto";
import type { User } from "../../types/user";
import type { Tarefa } from "../../types/tarefa";
// import { data } from "react-router-dom"; // Importação não utilizada
import { getProjetos } from "../../services/projetoService";
import { getTarefas } from "../../services/tarefaService"; // Deve ser usada se for carregar tarefas
import { getUsers } from "../../services/userService";

// Define a estrutura do estado formData para edição de projeto
interface ProjetoFormData {
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFimPrevista: string;
  // Adicione aqui outros campos do Projeto que você precisa editar, como id do gerente.
  // Exemplo: gerenteId: number | "";
}

interface EditarProjetoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (id: number, dados: Partial<ProjetoFormData>) => Promise<void>;
  projeto: Projeto | null;
}

export const EditarProjetoModal = ({
  open,
  onClose,
  onSave,
  projeto,
}: EditarProjetoModalProps) => {
  // Inicialização do estado formData com todos os campos necessários do projeto
  const [formData, setFormData] = useState<ProjetoFormData>({
    nome: projeto?.nome || "",
    descricao: projeto?.descricao || "",
    dataInicio: projeto?.dataInicio
      ? new Date(projeto.dataInicio).toISOString().split("T")[0]
      : "",
    dataFimPrevista: projeto?.dataFimPrevista
      ? new Date(projeto.dataFimPrevista).toISOString().split("T")[0]
      : "",
    // Exemplo: gerenteId: projeto?.gerenteId || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]); // Gerentes ou membros da equipe
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (open && projeto) {
      // Formata as datas para o formato "YYYY-MM-DD" exigido pelo input "date"
      const dataInicioFormatted = projeto.dataInicio
        ? new Date(projeto.dataInicio).toISOString().split("T")[0]
        : "";
      const dataFimPrevistaFormatted = projeto.dataFimPrevista
        ? new Date(projeto.dataFimPrevista).toISOString().split("T")[0]
        : "";

      setFormData({
        nome: projeto.nome || "",
        descricao: projeto.descricao || "",
        dataInicio: dataInicioFormatted,
        dataFimPrevista: dataFimPrevistaFormatted,
        // Exemplo: gerenteId: projeto.gerenteId || "",
      });
      setErrors({});
      setTouched({});
      loadData();
    }
  }, [open, projeto]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // Corrigindo o Promise.all para incluir o getTarefas() e corresponder aos setStates
      const [projetosData, tarefasData, usuariosData] = await Promise.all([
        getProjetos(),
        getTarefas(), // Agora carregando as tarefas
        getUsers(),
      ]);
      setProjetos(projetosData);
      setTarefas(tarefasData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof ProjetoFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      // A tipagem de `field` e `value` é mais segura aqui
      const error = validateField(projetoUpdateSchema, field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof ProjetoFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field];
    // A tipagem de `field` e `value` é mais segura aqui
    const error = validateField(projetoUpdateSchema, field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async () => {
    if (!projeto) return;

    const newTouched: Record<string, boolean> = {};
    const newErrors: Record<string, string> = {};

    // Valida todos os campos do formData antes de enviar
    for (const key of Object.keys(formData) as Array<keyof ProjetoFormData>) {
      newTouched[key] = true;
      const error = validateField(
        projetoUpdateSchema,
        key,
        formData[key]
      );
      if (error) newErrors[key] = error;
    }

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      // Garante que apenas os campos de ProjetoFormData sejam passados
      await onSave(projeto.id, formData);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Projeto</DialogTitle>
      <DialogContent>
        {loadingData ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4, mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {/* Campo: Nome */}
            <TextField
              label="Nome do Projeto" // Rótulo corrigido
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

            {/* Campo: Data de Início */}
            <TextField
              label="Data de Início"
              type="date" // Tipo de input corrigido
              value={formData.dataInicio}
              onChange={(e) => handleInputChange("dataInicio", e.target.value)}
              onBlur={() => handleBlur("dataInicio")}
              error={touched.dataInicio && !!errors.dataInicio}
              helperText={touched.dataInicio && errors.dataInicio}
              fullWidth
              InputLabelProps={{ shrink: true }} // Garante que o rótulo seja exibido corretamente
            />

            {/* Campo: Data Fim Prevista */}
            <TextField
              label="Data Fim Prevista"
              type="date" // Tipo de input corrigido
              value={formData.dataFimPrevista}
              onChange={(e) =>
                handleInputChange("dataFimPrevista", e.target.value)
              }
              onBlur={() => handleBlur("dataFimPrevista")}
              error={touched.dataFimPrevista && !!errors.dataFimPrevista}
              helperText={touched.dataFimPrevista && errors.dataFimPrevista}
              fullWidth
              InputLabelProps={{ shrink: true }} // Garante que o rótulo seja exibido corretamente
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
          disabled={loading || loadingData}
        >
          {loading ? <CircularProgress size={24} /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};