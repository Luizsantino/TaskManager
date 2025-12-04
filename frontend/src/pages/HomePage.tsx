import { Box, Button, Paper, Typography, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AVATAR_SIZE = 72;

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box position="relative" minHeight="100vh" width="100vw">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Paper elevation={2} sx={{ p: 3, width: 320 }}>
          <Box textAlign="center" mb={2}>
            <Box display="flex" justifyContent="center" mb={1}>
              <Avatar
                src="https://grupomateus.atlassian.net/rest/servicedesk/1/customer/viewport-resources/portal-logo/24/1301"
                alt="Task Manager"
                sx={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  bgcolor: "transparent",
                }}
                slotProps={{ img: { loading: "lazy" } }}
              />
            </Box>
            <Typography variant="h5" component="h1" fontWeight={600} mb={2}>
              Gerenciador de Projetos e Tarefas
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
              type="button"
              onClick={() => navigate("/projetos")}
            >
              Projetos
            </Button>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              type="button"
              onClick={() => navigate("/tarefas")}
            >
              Tarefas
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Home;