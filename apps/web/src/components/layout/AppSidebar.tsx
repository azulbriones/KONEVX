import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import styles from "./AppSidebar.module.css";

export type AppSidebarItem = {
  label: string;
  to: string;
  icon: ReactNode;
};

type AppSidebarProps = {
  title: string;
  subtitle: string;
  items: AppSidebarItem[];
  activePath: string;
  onNavigate: (to: string) => void;
  compact?: boolean;
};

const isActivePath = (activePath: string, to: string) => {
  if (to === "/") return activePath === "/";
  return activePath === to || activePath.startsWith(`${to}/`);
};

export const AppSidebar = ({
  title,
  subtitle,
  items,
  activePath,
  onNavigate,
  compact = false,
}: AppSidebarProps) => {
  return (
    <Box className={styles.sidebar} data-compact={compact ? "true" : "false"}>
      <Box className={styles.header}>
        <Box className={styles.brandMark} />
        <Box className={styles.content}>
          <Typography className={styles.title}>{title}</Typography>
          <Typography variant="caption" className={styles.subtitle}>
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Divider className={styles.divider} />

      <Box>
        <Typography variant="overline" className={styles.menuLabel}>
          Menú
        </Typography>
        <List disablePadding className={styles.menuList}>
          {items.map((item) => {
            const selected = isActivePath(activePath, item.to);

            return (
              <ListItemButton
                key={item.to}
                selected={selected}
                aria-current={selected ? "page" : undefined}
                onClick={() => onNavigate(item.to)}
                className={styles.menuItem}
              >
                <ListItemIcon
                  className={
                    selected ? styles.menuIconSelected : styles.menuIcon
                  }
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ className: styles.menuText }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};
