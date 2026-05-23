import { makeStyles } from '@material-ui/core';

export const useScaffolderStyles = makeStyles(theme => ({
  pageRoot: {
    background: '#f0f2f5',
    minHeight: '100%',
    padding: theme.spacing(3, 3, 4),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2, 1.5, 3),
    },
  },
  listHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
  },
  listHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    marginTop: theme.spacing(0.5),
  },
  headerActionButton: {
    borderRadius: 10,
    textTransform: 'none',
    fontWeight: 600,
    borderColor: 'rgba(13, 115, 119, 0.35)',
    color: '#0d7377',
  },
  filterToolbar: {
    display: 'grid',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    background: '#fff',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
    },
  },
  filterRowPrimary: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: theme.spacing(1.5),
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: '1fr',
    },
  },
  filterRowSecondary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: theme.spacing(1.5),
    alignItems: 'end',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: '1fr',
    },
  },
  filterSearchWrap: {
    minWidth: 0,
  },
  filterSelectWrap: {
    minWidth: 0,
  },
  scopeToggle: {
    display: 'inline-flex',
    height: 40,
    background: '#f4f6f8',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.08)',
    flexShrink: 0,
    overflow: 'hidden',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
    '& .MuiButton-root': {
      border: 'none',
      borderRadius: 0,
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.85rem',
      color: theme.palette.text.secondary,
      padding: theme.spacing(0.75, 1.5),
      lineHeight: 1.2,
      minHeight: 38,
      minWidth: 72,
      background: 'transparent',
      '&:not(:last-child)': {
        borderRight: '1px solid rgba(0,0,0,0.08)',
      },
      '&:hover': {
        background: 'rgba(13, 115, 119, 0.08)',
      },
      '&.Mui-disabled': {
        opacity: 0.45,
      },
      [theme.breakpoints.down('xs')]: {
        flex: 1,
      },
    },
  },
  scopeToggleActive: {
    background: 'linear-gradient(135deg, #0d7377 0%, #14a085 100%) !important',
    color: '#fff !important',
    boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.08)',
    '&:hover': {
      background: 'linear-gradient(135deg, #0a5c5f 0%, #0d7377 100%) !important',
    },
  },
  templatesContent: {
    width: '100%',
  },
  filterToolbarShell: {
    '& .MuiFormControl-root': {
      width: '100%',
      margin: 0,
    },
    '& .MuiInputLabel-root, & .ScaffolderReactTemplateCategoryPicker-label, & .CatalogReactEntityTagPicker-root > label, & .CatalogReactEntityOwnerPicker-label': {
      display: 'none !important',
    },
    '& .ScaffolderReactTemplateCategoryPicker-root, & .CatalogReactEntityTagPicker-root, & .CatalogReactEntityOwnerPicker-root': {
      padding: '0 !important',
      margin: 0,
    },
    '& .MuiInputBase-root, & .MuiOutlinedInput-root': {
      borderRadius: 10,
      background: '#fafbfc',
      border: '1px solid rgba(0,0,0,0.08)',
      minHeight: 40,
      fontSize: '0.875rem',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        borderColor: 'rgba(13, 115, 119, 0.35)',
      },
      '&.Mui-focused': {
        borderColor: '#7df3e1',
        boxShadow: '0 0 0 3px rgba(125, 243, 225, 0.2)',
        background: '#fff',
      },
    },
    '& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiOutlinedInput-notchedOutline': {
      display: 'none',
    },
    '& .MuiAutocomplete-inputRoot': {
      paddingTop: '6px !important',
      paddingBottom: '6px !important',
    },
    '& .CatalogReactEntitySearchBar-root': {
      margin: 0,
    },
    '& .CatalogReactEntitySearchBar-root .MuiInputBase-root': {
      padding: theme.spacing(0.75, 1.25),
    },
    '& .MuiAutocomplete-endAdornment .MuiIconButton-root': {
      padding: 6,
    },
  },
  listHeaderLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
  listHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0d7377 0%, #14a085 100%)',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(13, 115, 119, 0.25)',
  },
  listTitle: {
    fontWeight: 700,
    fontSize: '1.75rem',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  listSubtitle: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    fontSize: '0.95rem',
  },
  filterCard: {
    borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    background: '#fff',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  filterTitle: {
    fontWeight: 700,
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#0d7377',
    marginBottom: theme.spacing(1.5),
  },
  wizardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  wizardIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0d7377 0%, #14a085 100%)',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(13, 115, 119, 0.25)',
  },
  wizardTitle: {
    fontWeight: 700,
    fontSize: '1.85rem',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  wizardDescription: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.75),
    fontSize: '0.95rem',
    maxWidth: 720,
    lineHeight: 1.5,
  },
  wizardSplit: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: theme.spacing(3),
    alignItems: 'start',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },
  wizardSplitGuide: {
    minWidth: 0,
  },
  wizardSplitForm: {
    minWidth: 0,
  },
  wizardSplitFormFull: {
    gridColumn: '1 / -1',
    minWidth: 0,
  },
  wizardFormPanel: {
    minWidth: 0,
    borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    background: '#fff',
    overflow: 'hidden',
    '& > div': {
      background: 'transparent',
      boxShadow: 'none',
      padding: 0,
    },
    '& .MuiPaper-root.MuiCard-root': {
      border: 'none',
      boxShadow: 'none',
      borderRadius: 0,
    },
    '& .MuiCardContent-root': {
      padding: theme.spacing(2, 2.5, 2.5),
    },
    '& .MuiStepper-root': {
      margin: theme.spacing(0, 0, 2),
    },
  },
  guidePanel: {
    borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    background: '#fff',
    overflow: 'hidden',
    position: 'sticky',
    top: theme.spacing(2),
    maxHeight: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      position: 'static',
      maxHeight: 'none',
      marginBottom: theme.spacing(2),
    },
  },
  guidePanelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2.5, 2.5, 1.5),
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    background: 'linear-gradient(180deg, #f8fafb 0%, #fff 100%)',
  },
  guidePanelIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0d7377 0%, #14a085 100%)',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(13, 115, 119, 0.2)',
  },
  guidePanelChip: {
    marginBottom: theme.spacing(0.75),
    background: 'rgba(13, 115, 119, 0.08)',
    color: '#0d7377',
    border: '1px solid rgba(13, 115, 119, 0.15)',
    fontWeight: 700,
    fontSize: '0.68rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    height: 24,
  },
  guidePanelTitle: {
    fontWeight: 700,
    fontSize: '1.05rem',
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
  },
  guidePanelBody: {
    padding: theme.spacing(2, 2.5, 2.5),
    overflowY: 'auto',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: theme.palette.text.primary,
    '& h1': {
      display: 'none',
    },
    '& h2': {
      fontSize: '0.95rem',
      fontWeight: 700,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      color: '#0d7377',
      letterSpacing: '-0.01em',
      '&:first-child': {
        marginTop: 0,
      },
    },
    '& h3': {
      fontSize: '0.88rem',
      fontWeight: 700,
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(0.75),
    },
    '& p': {
      marginTop: 0,
      marginBottom: theme.spacing(1.25),
      color: theme.palette.text.secondary,
    },
    '& ul, & ol': {
      marginTop: 0,
      marginBottom: theme.spacing(1.5),
      paddingLeft: theme.spacing(2.5),
      color: theme.palette.text.secondary,
    },
    '& li': {
      marginBottom: theme.spacing(0.5),
    },
    '& code': {
      background: '#f4f6f8',
      padding: theme.spacing(0.25, 0.5),
      borderRadius: 6,
      fontSize: '0.82rem',
    },
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: theme.spacing(1.5),
      fontSize: '0.82rem',
    },
    '& th, & td': {
      border: '1px solid rgba(0,0,0,0.08)',
      padding: theme.spacing(0.75, 1),
      textAlign: 'left',
    },
    '& th': {
      background: '#f8fafb',
      fontWeight: 700,
    },
    '& a': {
      color: '#0d7377',
      fontWeight: 600,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
  templateCard: {
    height: '100%',
    '& > .MuiPaper-root': {
      borderRadius: 14,
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      height: '100%',
    },
    '&:hover > .MuiPaper-root': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(13, 115, 119, 0.12)',
      borderColor: 'rgba(125, 243, 225, 0.5)',
    },
  },
  templateCardTitle: {
    fontWeight: 700,
    fontSize: '1.05rem',
  },
  shell: {
    '&.foundry-scaffolder-wizard .MuiCardHeader-root': {
      display: 'none',
    },
    '&.foundry-scaffolder-wizard .MuiCardContent-root': {
      paddingTop: theme.spacing(1),
    },
    '& > .MuiGrid-root > .MuiGrid-item > .MuiPaper-root': {
      background: 'transparent',
      boxShadow: 'none',
    },
    '& .MuiPaper-root.MuiCard-root': {
      borderRadius: 16,
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    },
    '& .MuiCardHeader-root': {
      padding: theme.spacing(2.5, 3, 1),
      '& .MuiCardHeader-title': {
        fontWeight: 700,
        fontSize: '1.15rem',
      },
      '& .MuiCardHeader-subheader': {
        color: theme.palette.text.secondary,
        fontSize: '0.9rem',
        marginTop: theme.spacing(0.5),
      },
    },
    '& .MuiCardContent-root': {
      padding: theme.spacing(0, 3, 3),
    },
    '& .MuiStepper-root': {
      padding: theme.spacing(2, 1, 3),
      background: '#f8fafb',
      borderRadius: 12,
      margin: theme.spacing(0, 0, 2),
    },
    '& .MuiStepIcon-active': {
      color: '#0d7377 !important',
    },
    '& .MuiStepIcon-completed': {
      color: '#14a085 !important',
    },
    '& .MuiStepLabel-label.MuiStepLabel-active': {
      fontWeight: 700,
      color: '#0d7377',
    },
    '& .MuiStepLabel-label': {
      fontSize: '0.85rem',
    },
    '& .BackstageTemplateStepper-formWrapper': {
      padding: theme.spacing(1, 0, 0),
    },
    '& .MuiFormControl-root': {
      marginBottom: theme.spacing(2),
    },
    '& .MuiInputLabel-root': {
      fontWeight: 600,
      fontSize: '0.875rem',
      color: theme.palette.text.primary,
      transform: 'translate(0, 24px) scale(1)',
      '&.MuiInputLabel-shrink': {
        transform: 'translate(0, 0) scale(0.85)',
      },
    },
    '& .MuiInputBase-root': {
      borderRadius: 10,
      background: '#fafbfc',
      border: '1px solid rgba(0,0,0,0.1)',
      padding: theme.spacing(0.75, 1.5),
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        borderColor: 'rgba(13, 115, 119, 0.35)',
      },
      '&.Mui-focused': {
        borderColor: '#7df3e1',
        boxShadow: '0 0 0 3px rgba(125, 243, 225, 0.2)',
        background: '#fff',
      },
    },
    '& .MuiInput-underline:before, & .MuiInput-underline:after': {
      display: 'none',
    },
    '& .MuiSelect-select:focus': {
      background: 'transparent',
    },
    '& .MuiFormHelperText-root': {
      fontSize: '0.78rem',
      marginTop: theme.spacing(0.75),
      color: theme.palette.text.secondary,
    },
    '& .MuiFormLabel-asterisk': {
      color: '#0d7377',
    },
    '& .MuiChip-root': {
      borderRadius: 8,
      fontWeight: 600,
      fontSize: '0.72rem',
      background: 'rgba(13, 115, 119, 0.08)',
      color: '#0d7377',
      border: '1px solid rgba(13, 115, 119, 0.15)',
    },
    '& .BackstageTemplateStepper-footer': {
      marginTop: theme.spacing(3),
      paddingTop: theme.spacing(2),
      borderTop: '1px solid rgba(0,0,0,0.06)',
      '& .MuiButton-root': {
        borderRadius: 10,
        textTransform: 'none',
        fontWeight: 600,
        padding: theme.spacing(1, 2.5),
      },
      '& .MuiButton-containedPrimary': {
        background: 'linear-gradient(135deg, #0d7377 0%, #14a085 100%)',
        boxShadow: '0 4px 14px rgba(13, 115, 119, 0.3)',
        '&:hover': {
          background: 'linear-gradient(135deg, #0a5c5f 0%, #0d7377 100%)',
        },
      },
    },
    '& .MuiAlert-root': {
      borderRadius: 10,
      marginBottom: theme.spacing(2),
    },
    '& .MuiAutocomplete-root .MuiInputBase-root': {
      padding: theme.spacing(0.5, 1),
    },
    '& .filterCard .MuiFormControl-root': {
      width: '100%',
      marginBottom: theme.spacing(1),
    },
    '& .filterCard .MuiInputBase-root': {
      borderRadius: 10,
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
    },
    '& .filterCard .MuiInput-underline:before, & .filterCard .MuiInput-underline:after': {
      display: 'none',
    },
    '& .item-card-grid': {
      '& .MuiGrid-item': {
        display: 'flex',
      },
    },
  },
}));
