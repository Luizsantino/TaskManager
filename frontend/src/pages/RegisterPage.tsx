// src/pages/RegisterPage.tsx
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material'; // Para centralizar
import { CriarUserModal } from '../components/users/CriarUserModal'; 

const RegisterPage = () => {
  const navigate = useNavigate();

  // Ação ao clicar em Cancelar ou fechar o modal
  const handleClose = useCallback(() => {
    navigate("/"); // Volta para a tela de Login
  }, [navigate]);

  // Ação após o cadastro de sucesso
  const handleSuccess = useCallback(() => {
    navigate("/"); // Redireciona para o Login após o cadastro
  }, [navigate]);

  return (
    // Box para garantir que o modal seja centralizado na tela
    <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh" 
        sx={{ backgroundColor: 'background.default' }} // Usa a cor de fundo do tema
    >
      <CriarUserModal 
        open={true} // Força a abertura, pois é uma página
        onClose={handleClose} 
        onSucess={handleSuccess} 
      />
    </Box>
  );
};

export default RegisterPage;