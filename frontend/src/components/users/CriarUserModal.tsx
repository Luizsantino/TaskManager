import { useState, useCallback } from "react";
import type { User } from "../../types/user";
import { createUser } from "../../services/userService";
import { validateCreateUser } from "../../schemas/validation";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    CircularProgress,
} from "@mui/material";

interface CriarUserModalProps {
    open: boolean;
    onClose: () => void;
    onSucess: (novoUser: User) => void;
}

export const CriarUserModal = ({
    open,
    onClose,
    onSucess,
}: CriarUserModalProps) => {
    const INITIAL_FORM_DATA = {
        nome: "",
        cargo: "",
        email: "",
        senha: "",
    };

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [salvando, setSalvando] = useState(false);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors]
    );

    const handleSave = useCallback(async () => {
        const validation = validateCreateUser(formData);

        if (!validation.success) {
            setErrors(validation.errors);
            return;
        }

        setSalvando(true);
        try {
            const novoUser = await createUser(validation.data);
            onSucess(novoUser);
            setFormData(INITIAL_FORM_DATA);
            setErrors({});
            onClose();
        }   catch (error) {
            console.error("Erro ao criar o usuário:", error);
            setErrors({ submit: "Erro ao criar usuário. Tente novamente." });
        } finally {
            setSalvando(false);
        }

    }, [FormData, onSucess, onClose]);

    const handleClose = useCallback(() => {
        setFormData(INITIAL_FORM_DATA);
        setErrors({});
        onClose();
    }, [onClose]);
    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          Cadastrar Novo Usuário
        </DialogTitle>
  
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Digite o nome completo"
              required
              error={!!errors.nome}
              helperText={errors.nome}
            />
  
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Digite o email"
              required
              error={!!errors.email}
              helperText={errors.email}
            />
          </Box>
        </DialogContent>
  
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
  
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={salvando}
          >
            {salvando ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Salvando...
              </>
            ) : (
              "Cadastrar"
            )}
          </Button>
        </DialogActions>
      </Dialog> 
    );



};

export default CriarUserModal;