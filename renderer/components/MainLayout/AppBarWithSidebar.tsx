import { Container, Grid, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";

import Sidebar from "./Sidebar";

const MainContent = styled("main")(({ theme }) => ({
  flexGrow: 1,
  height: "100vh",
  overflow: "auto",
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
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar open={open} handleDrawerToggle={handleDrawerToggle} />
      <MainContent id="mainContent">
        <Box
          sx={{
            root: (theme) => ({ ...theme.mixins.toolbar }),
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
