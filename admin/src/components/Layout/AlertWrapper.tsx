import { Dispatch, SetStateAction } from 'react';
import { Alert, Stack } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { getTranslation } from '../../utils/getTranslation';
import { Box } from '@strapi/design-system';

type AlertWrapperProps = {
  variant: string;
  message?: string;
  toggleAlert: Dispatch<SetStateAction<boolean>>;
};

const AlertWrapper = ({ variant, message, toggleAlert }: AlertWrapperProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box style={{ position: 'absolute', top: 0, right: 0, zIndex: 9999, left: 0 }}>
      <Alert
        onClose={() => toggleAlert(false)}
        title={formatMessage({ id: getTranslation(`alert.${variant}`) })}
        variant={variant}
      >
        {message ?? formatMessage({ id: getTranslation(`alert.description.${variant}`) })}
      </Alert>
    </Box>
  );
};

AlertWrapper.defaultProps = {
  variant: 'success',
};

export default AlertWrapper;
