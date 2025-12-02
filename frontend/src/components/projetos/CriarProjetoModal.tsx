import { useState, useEffect } from "react";
import { Modal, Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip } from "@mui/material";
import projetoService, { type ProjetoPayload } from "../../services/projetoService";
import userService from "../../services/userService"; // Supondo que você tenha um service para usuários
import type { User } from "../../types/user";

interface ProjetoModalProps {
    open: boolean;
    onClose: () => void;
    onProjetoCreated: (projeto: any) => void; // Callback para atualizar a lista de projetos
}

const ProjetoModal = ({ open, onClose, onProjetoCreated }: ProjetoModalProps) => {
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFimPrevista, setDataFimPrevista] = useState("");
    const [usuarios, setUsuarios] = useState<number[]>([]);
    const [allUsuarios, setAllUsuarios] = useState<User[]>([]);

    // Carrega lista de usuários para selecionar
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const usuarios = await userService.getUsers(); // Retorna lista de usuários
                setAllUsuarios(usuarios);
            } catch (err) {
                console.error("Erro ao buscar usuários:", err);
            }
        };
        fetchUsuarios();
    }, []);

    const handleSubmit = async () => {
        try {
            const payload: ProjetoPayload = {
                nome,
                descricao,
                dataInicio: new Date(dataInicio).toISOString(),
                dataFimPrevista: new Date(dataFimPrevista).toISOString(),
            };
    
            const projeto = await projetoService.createProjeto(payload);
    
            // Vincula os usuários opcionalmente
            for (const userId of usuarios) {
                try {
                    await projetoService.addUsuarioToProjeto(projeto.id, userId);
                } catch (err) {
                    console.error(`Erro ao vincular usuário ${userId}:`, err);
                }
            }
    
            onProjetoCreated(projeto);
            handleClose();
        } catch (err: any) {
            console.error("Erro ao criar projeto:", err);
            if (err.response) {
                console.error("Resposta do servidor:", err.response.data);
            }
        }
    };

    const handleClose = () => {
        // Limpa campos ao fechar modal
        setNome("");
        setDescricao("");
        setDataInicio("");
        setDataFimPrevista("");
        setUsuarios([]);
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', width: 400,
                bgcolor: 'background.paper', p: 4, borderRadius: 2
            }}>
                <h2>Cadastrar Projeto</h2>

                <TextField fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} margin="normal" />
                <TextField fullWidth label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} margin="normal" />
                <TextField
                    fullWidth label="Data Início" type="date"
                    value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
                    margin="normal" InputLabelProps={{ shrink: true }}
                />
                <TextField
                    fullWidth label="Data Fim Prevista" type="date"
                    value={dataFimPrevista} onChange={(e) => setDataFimPrevista(e.target.value)}
                    margin="normal" InputLabelProps={{ shrink: true }}
                />

                {/* Multi-select de usuários */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="usuarios-label">Usuários</InputLabel>
                    <Select
                        labelId="usuarios-label"
                        multiple
                        value={usuarios}
                        onChange={(e) => setUsuarios(typeof e.target.value === 'string' ? e.target.value.split(',').map(Number) : e.target.value)}
                        input={<OutlinedInput label="Usuários" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((id) => {
                                    const user = allUsuarios.find(u => u.id === id);
                                    return <Chip key={id} label={user?.nome || id} />;
                                })}
                            </Box>
                        )}
                    >
                        {allUsuarios.map(user => (
                            <MenuItem key={user.id} value={user.id}>{user.nome}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>Salvar</Button>
            </Box>
        </Modal>
    );
};

export default ProjetoModal;
