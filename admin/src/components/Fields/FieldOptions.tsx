import * as React from 'react';
import { useState } from 'react';
import { Box, Checkbox, Divider, Flex, Textarea, Typography } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { FieldConfigProps } from '../../utils/types';
import FieldValidation from './FieldValidation';
import { getTranslation } from '../../utils/getTranslation';
import { FieldTypeEnum } from '../../utils/enums';

type FieldOptions = {
  field: FieldTypeEnum;
  config: FieldConfigProps;
  options: string;
  setOptions: (props: any) => void;
  setConfig: (props: any) => void;
};
const FieldOptions = ({ field, config, setConfig, options, setOptions }: FieldOptions) => {
  const [content, setContent] = useState<string>(options);
  const [checked, setChecked] = useState<boolean | {}>(config?.required);

  const { formatMessage } = useIntl();

  const setIsChecked = (checked: boolean) => {
    setChecked(checked);
    setConfig({ ...config, required: checked });
  };

  const handleTextarea = (content: string) => {
    setContent(content);
    setOptions(content);
  };

  return (
    <Flex direction="column" gap={3} style={{ width: '100%' }} alignItems="flex-start">
      {field === FieldTypeEnum.Select ||
      field === FieldTypeEnum.Radio ||
      field === FieldTypeEnum.CheckboxGroup ? (
        <>
          <Box style={{ width: '100%' }}>
            <Textarea
              style={{ width: '100%' }}
              //   onBlur={() => setOptions(content)}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handleTextarea(event.currentTarget.value)
              }
              label={formatMessage({
                id: getTranslation('forms.fields.extra_props.children'),
              })}
              name="children"
              placeholder={formatMessage({
                id: getTranslation('forms.fields.extra_props.children_placeholder'),
              })}
            >
              {content}
            </Textarea>
          </Box>
          <Divider style={{ width: '100%' }} />
        </>
      ) : null}
      <Typography variant="omega" fontWeight="bold">
        {formatMessage({
          id: getTranslation('forms.fields.extra_props.validation'),
        })}
      </Typography>
      <Checkbox
        name="isRequired"
        checked={checked}
        onCheckedChange={(checked: boolean) => setIsChecked(checked)}
      >
        {formatMessage({ id: getTranslation('forms.fields.extra_props.required') })}
      </Checkbox>
      <FieldValidation config={config} setConfig={setConfig} field={field} />
    </Flex>
  );
};

export default FieldOptions;
