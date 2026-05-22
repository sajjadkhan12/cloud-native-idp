import {
  createFrontendModule,
  PageBlueprint,
  createRouteRef,
} from '@backstage/frontend-plugin-api';
import HomeIcon from '@material-ui/icons/Home';

export const homeRouteRef = createRouteRef();

const homePage = PageBlueprint.make({
  name: 'home',
  params: {
    path: '/',
    title: 'Home',
    icon: <HomeIcon />,
    routeRef: homeRouteRef,
    noHeader: true,
    loader: () =>
      import('./HomePage').then(m => <m.HomePage />),
  },
});

export const homeModule = createFrontendModule({
  pluginId: 'app',
  extensions: [homePage],
});
