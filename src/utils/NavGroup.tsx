
import { ListSubheader } from '@mui/material';

interface NavGroupProps {
  item: {
    subheader: string;
  };
}

export const NavGroup = ({ item }: NavGroupProps) => {
  return <ListSubheader sx={{ opacity: "0.8" }}>{item.subheader}</ListSubheader>;
};

