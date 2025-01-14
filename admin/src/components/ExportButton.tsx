import { useIntl } from 'react-intl';
import { useState } from 'react';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';

/*
 * Strapi Design system
 */
import { LinkButton, Loader } from '@strapi/design-system';
import { Download } from '@strapi/icons';
import { PLUGIN_ID } from '../pluginId';

type ExportButtonProps = {
  formId: number;
  disabled: boolean;
};

const ExportButton = ({ formId, disabled }: ExportButtonProps) => {
  const { formatMessage } = useIntl();
  const [loading, toggleLoading] = useState(false);
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();

  const processSubmissionExport = async (formId: number) => {
    toggleLoading(true);

    get(`/${PLUGIN_ID}/submissions/export/${formId}`).then((response: any) => {
      const blob = new Blob([response.data.data]);
      const link = document.createElement('a');

      link.href = window.URL.createObjectURL(blob);

      link.download = response.data.filename;
      link.click();

      toggleLoading(false);
      toggleNotification({
        type: 'success',
      });
    });
  };

  return (
    <>
      <LinkButton
        variant="secondary"
        disabled={loading || disabled}
        onClick={() => processSubmissionExport(formId)}
        startIcon={loading ? <Loader small /> : <Download />}
      >
        {formatMessage({
          id: `${PLUGIN_ID}.forms.fields.actions.export_submissions`,
        })}
      </LinkButton>
    </>
  );
};

export default ExportButton;
