import { Entity } from '@backstage/catalog-model';

export const TEMPLATE_GUIDE_ANNOTATION = 'foundry.io/template-guide';



export const resolveTemplateGuide = (entity?: Entity): string | undefined => {
  if (!entity) {
    return undefined;
  }

  const fromAnnotation = entity.metadata.annotations?.[TEMPLATE_GUIDE_ANNOTATION];
  if (fromAnnotation?.trim()) {
    return fromAnnotation.trim();
  }
};
