import Chip from '@material-ui/core/Chip';
import { CatalogTable } from '@backstage/plugin-catalog';
import type { CatalogTableColumnsFunc } from '@backstage/plugin-catalog';

const pillStyle = (bg: string, color: string, border: string) => ({
  background: bg,
  color,
  border: `1px solid ${border}`,
  fontWeight: 600,
  fontSize: '0.72rem',
  height: 26,
  borderRadius: 8,
});

const TypePill = ({ value }: { value?: string }) =>
  value ? (
    <Chip
      label={value}
      size="small"
      style={pillStyle(
        'rgba(13, 115, 119, 0.1)',
        '#0d7377',
        'rgba(13, 115, 119, 0.22)',
      )}
    />
  ) : null;

const LifecyclePill = ({ value }: { value?: string }) => {
  if (!value) return null;
  const experimental = value.toLowerCase() === 'experimental';
  return (
    <Chip
      label={value}
      size="small"
      style={pillStyle(
        experimental ? 'rgba(245, 158, 11, 0.12)' : 'rgba(99, 102, 241, 0.1)',
        experimental ? '#b45309' : '#4f46e5',
        experimental ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.22)',
      )}
    />
  );
};

export const foundryCatalogColumns: CatalogTableColumnsFunc = context => {
  const columns = CatalogTable.defaultColumnsFunc(context);

  return columns.map(column => {
    if (column.field === 'entity.spec.type') {
      return {
        ...column,
        render: ({ entity }) => (
          <TypePill value={entity.spec?.type as string | undefined} />
        ),
      };
    }

    if (column.field === 'entity.spec.lifecycle') {
      return {
        ...column,
        render: ({ entity }) => (
          <LifecyclePill value={entity.spec?.lifecycle as string | undefined} />
        ),
      };
    }

    return column;
  });
};
