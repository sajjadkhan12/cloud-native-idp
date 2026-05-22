import { ReactNode, useMemo } from 'react';
import { ThemeProvider, createTheme, useTheme } from '@material-ui/core/styles';

export const FoundrySidebarTheme = ({ children }: { children: ReactNode }) => {
  const outerTheme = useTheme();
  const navTheme = useMemo(
    () =>
      createTheme({
        ...outerTheme,
        palette: {
          ...outerTheme.palette,
          navigation: {
            ...outerTheme.palette.navigation,
            background: '#171717',
            color: '#b5b5b5',
            indicator: '#7df3e1',
            selectedColor: '#ffffff',
            navItem: {
              hoverBackground: 'rgba(125, 243, 225, 0.1)',
            },
            submenu: {
              background: '#212121',
            },
          },
        },
      }),
    [outerTheme],
  );

  return <ThemeProvider theme={navTheme}>{children}</ThemeProvider>;
};
