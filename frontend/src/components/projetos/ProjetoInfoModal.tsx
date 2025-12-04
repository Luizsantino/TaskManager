import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider
} from "@mui/material";
import type { Projeto } from "../../types/projeto";

interface ProjetoInfoModalProps {
  open: boolean;
  onClose: () => void;
  projeto: Projeto | null;
}

const ProjetoInfoModal: React.FC<ProjetoInfoModalProps> = ({
  open,
  onClose,
  projeto,
}) => {
  if (!projeto) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>📌 Informações do Projeto</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">{projeto.nome}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography>
          <strong>Descrição:</strong> {projeto.descricao}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Data de Início:</strong>{" "}
          {new Date(projeto.dataInicio).toLocaleDateString()}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Data Final Prevista:</strong>{" "}
          {new Date(projeto.dataFimPrevista).toLocaleDateString()}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Status ID:</strong> {projeto.statusId}
        </Typography>
      </DialogContent>

      <DialogActions>
        
        <Button variant="contained" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjetoInfoModal;
