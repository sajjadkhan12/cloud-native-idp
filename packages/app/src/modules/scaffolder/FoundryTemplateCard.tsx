import { TemplateCard, TemplateCardProps } from '@backstage/plugin-scaffolder-react/alpha';
import { Box } from '@material-ui/core';
import { useScaffolderStyles } from './scaffolderStyles';

export const FoundryTemplateCard = (props: TemplateCardProps) => {
  const classes = useScaffolderStyles();

  return (
    <Box className={classes.templateCard}>
      <TemplateCard {...props} />
    </Box>
  );
};
