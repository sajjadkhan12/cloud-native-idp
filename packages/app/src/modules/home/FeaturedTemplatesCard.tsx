import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { Card, CardContent, Typography, Button, Box, makeStyles } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    height: '100%',
  },
  title: {
    fontWeight: 700,
    fontSize: '0.85rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  templateList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  templateRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5),
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transform: 'translateY(-1px)',
    },
  },
  templateInfo: {
    flex: 1,
    marginRight: theme.spacing(2),
  },
  templateTitle: {
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  templateDesc: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  createButton: {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: 20,
    padding: theme.spacing(0.5, 2),
    background: 'linear-gradient(135deg, #0d7377, #14a085)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(135deg, #14a085, #7df3e1)',
    },
  },
}));

export const FeaturedTemplatesCard = () => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [templates, setTemplates] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    catalogApi.getEntities({
      filter: { kind: 'Template' },
      fields: ['metadata.name', 'metadata.title', 'metadata.description'],
    }).then(res => {
      if (active) {
        setTemplates(res.items);
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [catalogApi]);

  if (loading) return null;
  if (templates.length === 0) return null;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.title}>Featured Templates</Typography>
        <Box className={classes.templateList}>
          {templates.slice(0, 4).map(template => {
            const name = template.metadata.name;
            const title = template.metadata.title ?? name;
            const desc = template.metadata.description ?? 'Create a new service using this golden path.';
            return (
              <Box key={name} className={classes.templateRow}>
                <Box className={classes.templateInfo}>
                  <Typography className={classes.templateTitle}>{title}</Typography>
                  <Typography className={classes.templateDesc}>{desc}</Typography>
                </Box>
                <Button
                  component={Link}
                  to={`/create/templates/default/${name}`}
                  variant="contained"
                  className={classes.createButton}
                  endIcon={<DoubleArrowIcon />}
                >
                  Create
                </Button>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};
