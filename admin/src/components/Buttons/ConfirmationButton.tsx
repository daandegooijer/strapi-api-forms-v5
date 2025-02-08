import { LinkButton } from '@strapi/design-system';
import Reply from '../Icons/Reply';
import { useIntl } from 'react-intl';
import { getTranslation } from '../../utils/getTranslation';
import { HandlerTypeEnum } from '../../utils/enums';

const ConfirmationButton = ({ handleOnClick }: { handleOnClick: Function }) => {
  const { formatMessage } = useIntl();

  return (
    <LinkButton
      variant={'secondary'}
      onClick={() => handleOnClick(HandlerTypeEnum.Confirmation)}
      startIcon={<Reply width={16} height={16} />}
    >
      {formatMessage({
        id: getTranslation('handlers.confirmation'),
      })}
    </LinkButton>
  );
};

export default ConfirmationButton;
