import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { ThemeBlueprint } from '@backstage/plugin-app-react';
import { UnifiedThemeProvider } from '@backstage/theme';
import DarkIcon from '@material-ui/icons/Brightness2';
import LightIcon from '@material-ui/icons/WbSunny';
import { foundryDarkTheme, foundryLightTheme } from './foundryThemes';

const foundryLightThemeExtension = ThemeBlueprint.make({
  name: 'foundry-light',
  params: {
    theme: {
      id: 'foundry-light',
      title: 'Foundry Light',
      variant: 'light',
      icon: <LightIcon />,
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={foundryLightTheme} themeName="foundry-light">
          {children}
        </UnifiedThemeProvider>
      ),
    },
  },
});

const foundryDarkThemeExtension = ThemeBlueprint.make({
  name: 'foundry-dark',
  params: {
    theme: {
      id: 'foundry-dark',
      title: 'Foundry Dark',
      variant: 'dark',
      icon: <DarkIcon />,
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={foundryDarkTheme} themeName="foundry-dark">
          {children}
        </UnifiedThemeProvider>
      ),
    },
  },
});

export const themeModule = createFrontendModule({
  pluginId: 'app',
  extensions: [foundryLightThemeExtension, foundryDarkThemeExtension],
});
