import { FieldExtensionOptions } from '@backstage/plugin-scaffolder-react';
import {
  EntityNamePickerFieldExtension,
  EntityPickerFieldExtension,
  EntityPickerFieldSchema,
  EntityTagsPickerFieldExtension,
  EntityTagsPickerFieldSchema,
  MultiEntityPickerFieldExtension,
  MyGroupsPickerFieldExtension,
  MyGroupsPickerFieldSchema,
  OwnedEntityPickerFieldExtension,
  OwnedEntityPickerFieldSchema,
  OwnerPickerFieldExtension,
  OwnerPickerFieldSchema,
  RepoBranchPickerFieldExtension,
  RepoOwnerPickerFieldExtension,
  RepoUrlPickerFieldExtension,
  RepoUrlPickerFieldSchema,
  repoPickerValidation,
} from '@backstage/plugin-scaffolder';

export const DEFAULT_SCAFFOLDER_FIELD_EXTENSIONS: FieldExtensionOptions[] = [
  {
    component: EntityPickerFieldExtension,
    name: 'EntityPicker',
    schema: EntityPickerFieldSchema,
  },
  {
    component: EntityNamePickerFieldExtension,
    name: 'EntityNamePicker',
  },
  {
    component: EntityTagsPickerFieldExtension,
    name: 'EntityTagsPicker',
    schema: EntityTagsPickerFieldSchema,
  },
  {
    component: RepoUrlPickerFieldExtension,
    name: 'RepoUrlPicker',
    validation: repoPickerValidation,
    schema: RepoUrlPickerFieldSchema,
  },
  {
    component: OwnerPickerFieldExtension,
    name: 'OwnerPicker',
    schema: OwnerPickerFieldSchema,
  },
  {
    component: OwnedEntityPickerFieldExtension,
    name: 'OwnedEntityPicker',
    schema: OwnedEntityPickerFieldSchema,
  },
  {
    component: MyGroupsPickerFieldExtension,
    name: 'MyGroupsPicker',
    schema: MyGroupsPickerFieldSchema,
  },
  {
    component: MultiEntityPickerFieldExtension,
    name: 'MultiEntityPicker',
  },
  {
    component: RepoBranchPickerFieldExtension,
    name: 'RepoBranchPicker',
  },
  {
    component: RepoOwnerPickerFieldExtension,
    name: 'RepoOwnerPicker',
  },
];

export function mergeScaffolderFieldExtensions(
  customFieldExtensions: FieldExtensionOptions[],
  loadedFormFields: FieldExtensionOptions[] = [],
): FieldExtensionOptions[] {
  const names = new Set(customFieldExtensions.map(field => field.name));

  const fromApi = loadedFormFields.filter(field => !names.has(field.name));
  fromApi.forEach(field => names.add(field.name));

  const defaults = DEFAULT_SCAFFOLDER_FIELD_EXTENSIONS.filter(
    field => !names.has(field.name),
  );

  return [...customFieldExtensions, ...fromApi, ...defaults];
}
