import { Entity } from '@backstage/catalog-model';

export const buildFilterFn = (
  filterFunction?: (entity: Entity) => boolean,
  filterExpression?: string,
): ((entity: Entity) => boolean) => {
  if (filterFunction) {
    return filterFunction;
  }
  if (!filterExpression) {
    return () => true;
  }
  return () => true;
};
