import { makeStyles } from '@material-ui/core';

export const useCatalogStyles = makeStyles(theme => ({
  root: {
    background: '#f0f2f5',
    minHeight: '100%',
    padding: theme.spacing(3, 3, 4),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2, 1.5, 3),
    },
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
  headerIcon: {
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
  title: {
    fontWeight: 700,
    fontSize: '1.75rem',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  subtitle: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    fontSize: '0.95rem',
  },
  stats: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
    flexWrap: 'wrap',
  },
  statChip: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    fontWeight: 600,
    fontSize: '0.8rem',
  },
  createButton: {
    background: 'linear-gradient(135deg, #0d7377 0%, #14a085 100%)',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 10,
    padding: theme.spacing(1, 2.5),
    boxShadow: '0 4px 14px rgba(13, 115, 119, 0.3)',
    textTransform: 'none',
    '&:hover': {
      background: 'linear-gradient(135deg, #0a5c5f 0%, #0d7377 100%)',
    },
  },
  filterCard: {
    borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    background: '#fff',
    overflow: 'visible',
  },
  filterCardContent: {
    padding: theme.spacing(2.5),
    '&:last-child': {
      paddingBottom: theme.spacing(2.5),
    },
  },
  filterTitle: {
    fontWeight: 700,
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#0d7377',
    marginBottom: theme.spacing(2),
  },
  filterSection: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: 12,
    background: '#f8fafb',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  filterSectionLabel: {
    fontWeight: 600,
    fontSize: '0.72rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  filtersShell: {
    '& .MuiFormControl-root': {
      width: '100%',
      marginBottom: theme.spacing(0.5),
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.8rem',
      fontWeight: 600,
      color: theme.palette.text.secondary,
    },
    '& .MuiInputBase-root': {
      borderRadius: 10,
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        borderColor: 'rgba(13, 115, 119, 0.35)',
      },
      '&.Mui-focused': {
        borderColor: '#7df3e1',
        boxShadow: '0 0 0 3px rgba(125, 243, 225, 0.2)',
      },
    },
    '& .MuiInput-underline:before, & .MuiInput-underline:after': {
      display: 'none',
    },
    '& .CatalogReactUserListPicker-root': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      margin: 0,
    },
    '& .CatalogReactUserListPicker-title': {
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      color: '#0d7377',
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(0.25),
    },
    '& .CatalogReactUserListPicker-root > .MuiCard-root': {
      background: '#fff',
      borderRadius: 10,
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: 'none',
      margin: theme.spacing(0.5, 0, 0),
    },
    '& .MuiMenuItem-root': {
      borderRadius: 8,
      margin: theme.spacing(0.25, 0.5),
      transition: 'background 0.15s ease',
      '&:hover': {
        background: 'rgba(125, 243, 225, 0.12)',
      },
      '&.Mui-selected': {
        background: 'linear-gradient(90deg, rgba(13,115,119,0.1) 0%, rgba(125,243,225,0.15) 100%)',
        borderLeft: '3px solid #0d7377',
        '&:hover': {
          background: 'linear-gradient(90deg, rgba(13,115,119,0.14) 0%, rgba(125,243,225,0.2) 100%)',
        },
      },
    },
    '& .MuiDivider-root': {
      opacity: 0.5,
    },
    '& .MuiListItemSecondaryAction-root .MuiTypography-root': {
      background: 'rgba(13, 115, 119, 0.1)',
      color: '#0d7377',
      borderRadius: 10,
      padding: theme.spacing(0.25, 1),
      fontWeight: 700,
      fontSize: '0.7rem',
      minWidth: 24,
      textAlign: 'center',
    },
    '& .MuiListItemIcon-root': {
      color: '#0d7377',
    },
  },
  tableCard: {
    borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    background: '#fff',
    overflow: 'hidden',
    padding: theme.spacing(0.5, 0, 1),
  },
  tableShell: {
    '& .MuiToolbar-root': {
      padding: theme.spacing(2, 2.5, 1),
      minHeight: 64,
      '& h6': {
        fontWeight: 700,
        fontSize: '1.05rem',
        letterSpacing: '-0.01em',
      },
    },
    '& .MuiTextField-root': {
      '& .MuiInputBase-root': {
        borderRadius: 10,
        background: '#f4f6f8',
        padding: theme.spacing(0.25, 1),
      },
      '& .MuiInput-underline:before, & .MuiInput-underline:after': {
        display: 'none',
      },
    },
    '& .MuiTable-root': {
      borderCollapse: 'separate',
      borderSpacing: '0 6px',
    },
    '& .MuiTableHead-root .MuiTableRow-root .MuiTableCell-head': {
      background: 'transparent',
      borderBottom: 'none',
      fontWeight: 700,
      fontSize: '0.68rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: theme.palette.text.secondary,
      padding: theme.spacing(0.5, 2, 1),
    },
    '& .MuiTableBody-root .MuiTableRow-root': {
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        '& .MuiTableCell-root': {
          boxShadow: '0 4px 16px rgba(13, 115, 119, 0.1)',
          borderColor: 'rgba(125, 243, 225, 0.4)',
        },
      },
    },
    '& .MuiTableBody-root .MuiTableCell-root': {
      background: '#fafbfc',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      padding: theme.spacing(1.75, 2),
      fontSize: '0.875rem',
      transition: 'box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease',
      '&:first-child': {
        borderLeft: '1px solid rgba(0,0,0,0.06)',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        borderRight: 'none',
      },
      '&:last-child': {
        borderRight: '1px solid rgba(0,0,0,0.06)',
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        borderLeft: 'none',
      },
      '&:not(:first-child):not(:last-child)': {
        borderLeft: 'none',
        borderRight: 'none',
      },
    },
    '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root': {
      background: '#fff',
    },
    '& .MuiTableBody-root .MuiTableRow-root:hover .MuiTableCell-root': {
      background: '#f0faf9',
    },
    '& .MuiTableCell-root a': {
      color: '#0d7377',
      fontWeight: 600,
      textDecoration: 'none',
      '&:hover': {
        color: '#14a085',
        textDecoration: 'underline',
      },
    },
    '& .MuiChip-root': {
      borderRadius: 8,
      fontWeight: 600,
      fontSize: '0.72rem',
      height: 26,
      background: 'rgba(13, 115, 119, 0.08)',
      color: '#0d7377',
      border: '1px solid rgba(13, 115, 119, 0.15)',
    },
    '& .MuiTablePagination-root': {
      borderTop: '1px solid rgba(0,0,0,0.06)',
      marginTop: theme.spacing(1),
    },
    '& .MuiIconButton-root': {
      borderRadius: 8,
      '&:hover': {
        background: 'rgba(125, 243, 225, 0.15)',
        color: '#0d7377',
      },
    },
  },
  layout: {
    '& > .MuiGrid-container': {
      alignItems: 'flex-start',
    },
  },
}));
