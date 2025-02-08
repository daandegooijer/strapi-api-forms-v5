import { HandlerTypeEnum } from '../../utils/enums';
import NotificationButton from './NotificationButton';
import ConfirmationButton from './ConfirmationButton';
import { NotificationType } from '../../utils/types';

const HandlerButtonGroup = ({
  notifications,
  setModalIsVisible,
  setHandlerType,
}: {
  notifications: NotificationType[];
  setModalIsVisible: Function;
  setHandlerType: Function;
}) => {
  const handleOnClick = (type: HandlerTypeEnum) => {
    const notification = notifications!.find((notification) => notification.identifier === type);

    setHandlerType(notification!);
    setModalIsVisible(true);
  };

  return (
    <>
      {notifications!.map((notification, index) =>
        notification.identifier === HandlerTypeEnum.Notification ? (
          <NotificationButton handleOnClick={handleOnClick} key={index} />
        ) : (
          <ConfirmationButton handleOnClick={handleOnClick} key={index} />
        )
      )}
    </>
  );
};

export default HandlerButtonGroup;
