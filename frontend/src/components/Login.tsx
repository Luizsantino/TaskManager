import {Box, Paper, Typography, TextField, Button, LoginIcon} from "@mui/material";

const Login: React.FC = () => {
    return (
        <Box>
            <Paper>
                <Box>
                    <LoginIcon />
                    <Typography> Bem-Vindo </Typography>
                    <Typography> Faça login para continuar </Typography>
                </Box>
                <Box>
                    <TextField label = "Email"/>
                    <TextField label = "Senha"/>
                    <Button>Entrar</Button>
                </box>
            </paper>
        </Box>
    );
};

export default Login;