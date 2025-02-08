import { SingleSelect, SingleSelectOption } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { NotificationType } from '../../utils/types';
import { Field, Step, useFormContext } from '../../context/FormContext';
import { getTranslation } from '../../utils/getTranslation';

const SelectEmail = ({
  notification,
  setValue,
}: {
  notification: NotificationType;
  setValue: Function;
}) => {
  const { state } = useFormContext();
  const { formatMessage } = useIntl();
  const emailFields: Field[] = [];

  state.steps.map((step: Step) =>
    step.layouts['lg'].map((block) => {
      if (Array.isArray(block.field)) {
        return;
      }

      const field: Field = block.field;

      if (field.type === 'email') {
        emailFields.push(block.field);
      }
    })
  );

  if (!Boolean(emailFields.length)) {
    return <></>;
  }

  return (
    <>
      <SingleSelect
        label={formatMessage({
          id: getTranslation('forms.fields.select_recipient'),
        })}
        value={notification.to}
        onChange={(event: any) => setValue('to', event)}
        placeholder={formatMessage({
          id: getTranslation('forms.fields.select_recipient'),
        })}
        name="to"
      >
        {emailFields.map((field: any, index: number) => (
          <SingleSelectOption value={field.name} key={`select-${field.name}-${index}`}>
            {field.label} field
          </SingleSelectOption>
        ))}
      </SingleSelect>
    </>
  );
};

export default SelectEmail;
