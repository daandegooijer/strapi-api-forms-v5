import { LinkButton } from '@strapi/design-system';
import Email from '../Icons/Email';
import { useIntl } from 'react-intl';
import { getTranslation } from '../../utils/getTranslation';
import { HandlerTypeEnum } from '../../utils/enums';

const NotificationButton = ({ handleOnClick }: { handleOnClick: Function }) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <LinkButton
        variant={'secondary'}
        onClick={() => handleOnClick(HandlerTypeEnum.Notification)}
        startIcon={<Email width={16} height={16} />}
      >
        {formatMessage({
          id: getTranslation('handlers.notification'),
        })}
      </LinkButton>
    </>
  );
};

export default NotificationButton;
