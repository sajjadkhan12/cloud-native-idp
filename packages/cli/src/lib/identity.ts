import type { FoundryConfig } from '../config/store';
import { parseTokenIdentity } from './jwt';

/** Resolve catalog owner from flags, config, or the current session token. */
export function resolveOwner(
  config: FoundryConfig,
  explicitOwner?: string,
): string {
  if (explicitOwner?.trim()) {
    return explicitOwner.trim();
  }

  if (config.defaults?.owner?.trim()) {
    return config.defaults.owner.trim();
  }

  if (config.token) {
    try {
      const identity = parseTokenIdentity(config.token);
      if (identity.entityRef) {
        return identity.entityRef;
      }
    } catch {
      // fall through
    }
  }

  throw new Error(
    'Owner is required. Pass --owner, set defaults.owner in config, or run `foundry auth login` first.',
  );
}

export function getIdentityFromConfig(config: FoundryConfig): {
  entityRef?: string;
  subject?: string;
} {
  if (!config.token) {
    return {};
  }
  try {
    return parseTokenIdentity(config.token);
  } catch {
    return {};
  }
}
