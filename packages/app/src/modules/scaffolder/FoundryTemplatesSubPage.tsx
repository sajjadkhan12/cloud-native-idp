import { useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { FieldExtensionOptions, SecretsContextProvider, useCustomFieldExtensions } from '@backstage/plugin-scaffolder-react';
import { formFieldsApiRef } from '@backstage/plugin-scaffolder/alpha';
import { useApi } from '@backstage/core-plugin-api';
import { FoundryTemplateListPage } from './FoundryTemplateListPage';
import { FoundryTemplateWizard } from './FoundryTemplateWizard';
import { mergeScaffolderFieldExtensions } from './defaultScaffolderFieldExtensions';

type FoundryTemplatesSubPageProps = {
  formFields?: FieldExtensionOptions[];
};

export const FoundryTemplatesSubPage = ({
  formFields: preloadedFormFields,
}: FoundryTemplatesSubPageProps) => {
  const formFieldsApi = useApi(formFieldsApiRef);
  const customFieldExtensions = useCustomFieldExtensions(undefined);
  const [loadedFormFields, setLoadedFormFields] = useState<FieldExtensionOptions[]>(
    preloadedFormFields ?? [],
  );

  useEffect(() => {
    if (preloadedFormFields) {
      return undefined;
    }

    let mounted = true;
    formFieldsApi?.loadFormFields().then(fields => {
      if (mounted) {
        setLoadedFormFields(fields);
      }
    });
    return () => {
      mounted = false;
    };
  }, [formFieldsApi, preloadedFormFields]);

  const formFields = useMemo(
    () => mergeScaffolderFieldExtensions(customFieldExtensions, loadedFormFields),
    [customFieldExtensions, loadedFormFields],
  );

  return (
    <Routes>
      <Route index element={<FoundryTemplateListPage />} />
      <Route
        path=":namespace/:templateName"
        element={
          <SecretsContextProvider>
            <FoundryTemplateWizard formFields={formFields} />
          </SecretsContextProvider>
        }
      />
    </Routes>
  );
};
