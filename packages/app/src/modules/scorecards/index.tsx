import {
  createFrontendPlugin,
  PageBlueprint,
  createRouteRef,
} from '@backstage/frontend-plugin-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';

export const scorecardsRouteRef = createRouteRef();

const scorecardsPage = PageBlueprint.make({
  name: 'scorecards',
  params: {
    path: '/scorecards',
    title: 'Scorecards',
    icon: <EmojiEventsIcon />,
    routeRef: scorecardsRouteRef,
    loader: () =>
      import('@internal/plugin-scorecards').then(m => <m.ScorecardsPage />),
  },
});

const entityScorecardCard = EntityCardBlueprint.make({
  name: 'entity-scorecard',
  params: {
    filter: entity => entity.kind.toLowerCase() === 'component',
    type: 'info',
    loader: () =>
      import('@internal/plugin-scorecards').then(m => (
        <m.EntityScorecardCard />
      )),
  },
});

export const scorecardsPlugin = createFrontendPlugin({
  pluginId: 'scorecards',
  title: 'Scorecards',
  icon: <EmojiEventsIcon />,
  routes: {
    root: scorecardsRouteRef,
  },
  extensions: [scorecardsPage, entityScorecardCard],
});
