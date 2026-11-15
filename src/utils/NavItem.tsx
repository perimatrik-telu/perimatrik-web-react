
import { NavLink } from 'react-router-dom';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import type { ElementType, MouseEventHandler } from 'react';

interface NavItemProps {
  item: {
    title: string;
    icon: ElementType<{ stroke?: number; size?: string }>;
    path: string;
  };
  pathDirect: string;
  onClick: MouseEventHandler<HTMLElement>;
}

export const NavItem = ({ item, pathDirect, onClick }: NavItemProps) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={NavLink}
        to={item.path}
        selected={pathDirect === item.path}
        onClick={onClick}
        sx={{
          whiteSpace: "nowrap",
          mb: 1,
        }}
      >
        <ListItemIcon>
          <item.icon stroke={1.5} size="1.3rem" />
        </ListItemIcon>
        <ListItemText>{item.title}</ListItemText>
      </ListItemButton>
    </ListItem>
  );
};

