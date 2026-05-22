import { ReactNode } from 'react';
import {
  createVersionedContext,
  createVersionedValueMap,
} from '@backstage/version-bridge';

const entityContextMenuContext = createVersionedContext(
  'entity-context-menu-context',
);

type EntityContextMenuProviderProps = {
  children: ReactNode;
  onMenuClose: () => void;
};

export const EntityContextMenuProvider = ({
  children,
  onMenuClose,
}: EntityContextMenuProviderProps) => (
  <entityContextMenuContext.Provider
    value={createVersionedValueMap({ 1: { onMenuClose } })}
  >
    {children}
  </entityContextMenuContext.Provider>
);
