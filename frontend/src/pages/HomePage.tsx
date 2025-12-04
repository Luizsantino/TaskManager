import React from 'react';
import CriarProjetoModal from '../components/projetos/CriarProjetoModal';
import ProjetoInfoModal from '../components/projetos/ProjetoInfoModal';
import {
  Box, Container, Typography, Grid, Button, Paper, Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import type { Projeto } from '../types/projeto';
import projetoService from '../services/projetoService';

interface IUser {
  nome: string;
  cargo: string;
}

const ListaProjetos: React.FC<{ projetos: Projeto[]; onSelect: (p: Projeto) => void }> = ({ projetos, onSelect }) => (
  <Paper sx={{ p: 2, minHeight: 300 }}>
    <Typography variant="h6" gutterBottom>📋 Meus Projetos Ativos</Typography>
    {projetos.length > 0 ? (
      projetos.map(p => (
        <Box
          key={p.id}
          sx={{ mb: 1, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
          onClick={() => onSelect(p)}
        >
          <Typography>{p.nome}</Typography>
        </Box>
      ))
    ) : (
      <Alert severity="info">Nenhum projeto cadastrado.</Alert>
    )}
  </Paper>
);

const ListaTarefas: React.FC = () => (
  <Paper sx={{ p: 2, minHeight: 300 }}>
    <Typography variant="h6" gutterBottom>✅ Tarefas Pendentes</Typography>
    <Alert severity="warning">Lista de tarefas do usuário será carregada aqui.</Alert>
  </Paper>
);

const HomePage: React.FC = () => {
  const user: IUser = { nome: "Luiz", cargo: "Desenvolvedor" };
  const isLoading: boolean = false;

  const [isProjetoModalOpen, setIsProjetoModalOpen] = React.useState(false);
  const [isProjetoInfoOpen, setIsProjetoInfoOpen] = React.useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = React.useState<Projeto | null>(null);
  const [projetos, setProjetos] = React.useState<Projeto[]>([]);

  const openProjetoModal = () => setIsProjetoModalOpen(true);
  const closeProjetoModal = () => setIsProjetoModalOpen(false);

  const openProjetoInfoModal = (p: Projeto) => {
    setProjetoSelecionado(p);
    setIsProjetoInfoOpen(true);
  };
  const closeProjetoInfoModal = () => setIsProjetoInfoOpen(false);

  const handleProjetoCreated = (projeto: Projeto) => {
    setProjetos(prev => [...prev, projeto]);
  };

  const handleProjetoUpdated = (projetoAtualizado: Projeto) => {
    setProjetos(prev => prev.map(p => (p.id === projetoAtualizado.id ? projetoAtualizado : p)));
  };

  const handleProjetoDeleted = (id: number) => {
    setProjetos(prev => prev.filter(p => p.id !== id));
  };

  React.useEffect(() => {
    const fetchProjetos = async () => {
      try {
        const data = await projetoService.getProjetos();
        setProjetos(data);
      } catch (err) {
        console.error("Erro ao carregar projetos:", err);
      }
    };

    fetchProjetos();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress /> 
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <CriarProjetoModal
        open={isProjetoModalOpen}
        onClose={closeProjetoModal}
        onProjetoCreated={handleProjetoCreated}
        projetoEdicao={projetoSelecionado}
        onProjetoUpdated={handleProjetoUpdated}
      />

      <ProjetoInfoModal
        open={isProjetoInfoOpen}
        onClose={closeProjetoInfoModal}
        projeto={projetoSelecionado}
        onEdit={() => {
          closeProjetoInfoModal();
          openProjetoModal();
        } }
        onDelete={handleProjetoDeleted} projetoEdicao={null}      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Bem-vindo(a), {user.nome}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user.cargo}
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs="auto">
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openProjetoModal}>
            Criar Novo Projeto
          </Button>
        </Grid>

        <Grid item xs="auto">
          <Button variant="contained" color="secondary" startIcon={<AddIcon />}>
            Criar Nova Tarefa
          </Button>
        </Grid>

        <Grid item xs="auto">
          <Button variant="outlined" color="warning" startIcon={<VpnKeyIcon />}>
            Alterar Senha
          </Button>
        </Grid>

        <Grid item xs="auto">
          <Button variant="text" color="error" startIcon={<SettingsIcon />}>
            Logout
          </Button>
        </Grid>
      </Grid>

      <hr />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ListaProjetos projetos={projetos} onSelect={openProjetoInfoModal} />
        </Grid>

        <Grid item xs={12} md={6}>
          <ListaTarefas />
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;