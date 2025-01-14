import { useIntl } from 'react-intl';
import { SingleSelect, SingleSelectOption } from '@strapi/design-system';
import { FieldTypeEnum } from '../../utils/enums';
import { FieldConfigProps } from '../../utils/types';
import { getTranslation } from '../../utils/getTranslation';
type FieldValidationProps = {
  field: FieldTypeEnum;
  config: FieldConfigProps;
  setConfig: (props: any) => void;
};

const FieldValidation = ({ field, config, setConfig }: FieldValidationProps) => {
  const { formatMessage } = useIntl();

  const setValidationSettings = (value: string | boolean, name: string) => {
    setConfig({
      ...config,
      validation: { ...config.validation, [name]: value },
    });
  };

  return (
    <>
      {field === FieldTypeEnum.File && (
        <>
          <SingleSelect
            value={config.validation?.allowedTypes}
            onChange={(event: string) => setValidationSettings(event, 'allowedTypes')}
            name="allowedTypes"
            label={formatMessage({
              id: getTranslation(`forms.fields.extra_props.file_exts`),
            })}
          >
            <SingleSelectOption value="images">Image (JPG, PNG, GIF)</SingleSelectOption>
            <SingleSelectOption value="files">File (PDF, CSV, EXCEL, DOCX)</SingleSelectOption>
          </SingleSelect>
        </>
      )}
    </>
  );
};

export default FieldValidation;
