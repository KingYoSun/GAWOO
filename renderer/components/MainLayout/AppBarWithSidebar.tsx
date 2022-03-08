import { Container, Grid, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";

import Sidebar from "./Sidebar";
import TopAppBar from "./TopAppBar";

const MainContent = styled("main")(({ theme }) => ({
  flexGrow: 1,
  height: "100vh",
  overflow: "auto",
  marginLeft: theme.spacing(2),
}));

const MainContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  minHeight: "90vh",
  display: "flex",
  flexDirection: "column",
}));

interface AppBarWithSidebarProps {
  children: React.ReactNode;
}

const AppBarWithSidebar = ({
  children,
}: AppBarWithSidebarProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <TopAppBar open={open} handleDrawerOpen={handleDrawerOpen} />
      <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
      <MainContent>
        <Box
          sx={{
            root: (theme) => ({ ...theme.mixins.toolbar }),
            marginTop: (theme) => theme.spacing(8),
          }}
        />
        <MainContainer maxWidth="md">
          <Grid container spacing={3}>
            {children}
          </Grid>
        </MainContainer>
      </MainContent>
    </Box>
  );
};

export default AppBarWithSidebar;
