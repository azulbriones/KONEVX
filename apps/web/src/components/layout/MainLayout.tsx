import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";

import styles from "./MainLayout.module.css";

export const MainLayout = () => (
  <Box className={styles.layout}>
    <Box component="main" className={styles.main}>
      <Container maxWidth="lg" disableGutters>
        <Outlet />
      </Container>
    </Box>
  </Box>
);
