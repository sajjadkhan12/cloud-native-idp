import { Entity } from '@backstage/catalog-model';

export type Check = {
  name: string;
  description: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  suggestion?: string;
};

export type ScorecardResult = {
  totalScore: number;
  maxScore: number;
  checks: Check[];
  tier: 'Gold' | 'Silver' | 'Bronze' | 'Needs Improvement';
};

export const calculateScore = (entity: Entity): ScorecardResult => {
  const checks: Check[] = [];

  // 1. Description
  const description = entity.metadata.description;
  const descPassed = typeof description === 'string' && description.trim().length > 10;
  checks.push({
    name: 'Has description',
    description: 'Entity has metadata.description defined with more than 10 characters',
    passed: descPassed,
    points: descPassed ? 10 : 0,
    maxPoints: 10,
    suggestion: 'Add a helpful, detailed description in catalog-info.yaml under metadata.description.',
  });

  // 2. Owner assigned
  const owner = entity.spec?.owner;
  const ownerPassed = typeof owner === 'string' && owner.trim() !== '' && owner.toLowerCase() !== 'guests' && owner.toLowerCase() !== 'group:guests';
  checks.push({
    name: 'Has owner assigned',
    description: 'Entity has spec.owner configured and is not Guests group',
    passed: ownerPassed,
    points: ownerPassed ? 15 : 0,
    maxPoints: 15,
    suggestion: 'Define a valid team group or user as owner in catalog-info.yaml spec.owner.',
  });

  // 3. TechDocs configured
  const techdocs = entity.metadata.annotations?.['backstage.io/techdocs-ref'];
  const techdocsPassed = typeof techdocs === 'string' && techdocs.trim() !== '';
  checks.push({
    name: 'Has TechDocs configured',
    description: 'Entity has techdocs-ref annotation pointing to markdown documentation',
    passed: techdocsPassed,
    points: techdocsPassed ? 15 : 0,
    maxPoints: 15,
    suggestion: 'Configure TechDocs by adding the annotation backstage.io/techdocs-ref: dir:. and creating an mkdocs.yml file.',
  });

  // 4. CI/CD pipeline
  const ci = entity.metadata.annotations?.['github.com/project-slug'];
  const ciPassed = typeof ci === 'string' && ci.trim() !== '';
  checks.push({
    name: 'Has CI/CD pipeline',
    description: 'Entity has github.com/project-slug annotation for build pipeline sync',
    passed: ciPassed,
    points: ciPassed ? 15 : 0,
    maxPoints: 15,
    suggestion: 'Set the github.com/project-slug annotation to point to your repository.',
  });

  // 5. Kubernetes annotations
  const k8s = entity.metadata.annotations?.['backstage.io/kubernetes-id'];
  const k8sPassed = typeof k8s === 'string' && k8s.trim() !== '';
  checks.push({
    name: 'Has Kubernetes annotations',
    description: 'Entity has backstage.io/kubernetes-id configured for cluster visibility',
    passed: k8sPassed,
    points: k8sPassed ? 10 : 0,
    maxPoints: 10,
    suggestion: 'Enable Kubernetes monitoring by adding the backstage.io/kubernetes-id annotation.',
  });

  // 6. Tags
  const tags = entity.metadata.tags;
  const tagsPassed = Array.isArray(tags) && tags.length >= 1;
  checks.push({
    name: 'Has tags',
    description: 'Entity has metadata.tags with at least one tag',
    passed: tagsPassed,
    points: tagsPassed ? 10 : 0,
    maxPoints: 10,
    suggestion: 'Add relevant technology or team tags under metadata.tags array.',
  });

  // 7. API defined
  const spec = entity.spec as any;
  const hasApi = (spec && (Array.isArray(spec.providesApis) && spec.providesApis.length > 0)) ||
                 (spec && (Array.isArray(spec.consumesApis) && spec.consumesApis.length > 0)) ||
                 (entity.relations?.some(r => r.type === 'providesApis' || r.type === 'consumesApis'));
  checks.push({
    name: 'Has API defined',
    description: 'Entity provides or consumes APIs registered in the portal',
    passed: !!hasApi,
    points: hasApi ? 10 : 0,
    maxPoints: 10,
    suggestion: 'Define providesApis or consumesApis in spec to document network API boundaries.',
  });

  // 8. System membership
  const system = (entity.spec as any)?.system;
  const systemPassed = typeof system === 'string' && system.trim() !== '';
  checks.push({
    name: 'Has system membership',
    description: 'Entity is affiliated with a defined platform system in spec.system',
    passed: systemPassed,
    points: systemPassed ? 10 : 0,
    maxPoints: 10,
    suggestion: 'Associate this component with a system using the spec.system property.',
  });

  // 9. Lifecycle defined
  const lifecycle = entity.spec?.lifecycle;
  const lifecyclePassed = typeof lifecycle === 'string' && lifecycle.trim() !== '';
  checks.push({
    name: 'Has lifecycle defined',
    description: 'Entity has spec.lifecycle configured (production, development, etc.)',
    passed: lifecyclePassed,
    points: lifecyclePassed ? 5 : 0,
    maxPoints: 5,
    suggestion: 'Add a lifecycle environment tag in spec.lifecycle (e.g. production, experimental).',
  });

  const totalScore = checks.reduce((sum, c) => sum + c.points, 0);
  const maxScore = 100;

  let tier: 'Gold' | 'Silver' | 'Bronze' | 'Needs Improvement' = 'Needs Improvement';
  if (totalScore >= 80) tier = 'Gold';
  else if (totalScore >= 60) tier = 'Silver';
  else if (totalScore >= 40) tier = 'Bronze';

  return {
    totalScore,
    maxScore,
    checks,
    tier,
  };
};
