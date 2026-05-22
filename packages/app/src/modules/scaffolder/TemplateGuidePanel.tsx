import { Box, Chip, Typography } from '@material-ui/core';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import { MarkdownContent } from '@backstage/core-components';
import { useScaffolderStyles } from './scaffolderStyles';

type TemplateGuidePanelProps = {
  title?: string;
  content?: string;
};

export const TemplateGuidePanel = ({
  title = 'Template guide',
  content,
}: TemplateGuidePanelProps) => {
  const classes = useScaffolderStyles();

  if (!content) {
    return null;
  }

  return (
    <Box className={classes.guidePanel}>
      <Box className={classes.guidePanelHeader}>
        <Box className={classes.guidePanelIcon}>
          <MenuBookIcon />
        </Box>
        <Box>
          <Typography className={classes.guidePanelTitle}>{title}</Typography>
        </Box>
      </Box>
      <Box className={classes.guidePanelBody}>
        <MarkdownContent content={content} linkTarget="_blank" />
      </Box>
    </Box>
  );
};
