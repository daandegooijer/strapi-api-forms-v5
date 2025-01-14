import React, { useState } from 'react';
import {
  Button,
  Modal,
  Divider,
  Flex,
  Field,
  SingleSelect,
  SingleSelectOption,
} from '@strapi/design-system';
import { useIntl } from 'react-intl';

import { getTranslation } from '../../utils/getTranslation';
import { FieldActionsEnum, FieldTypeEnum } from '../../utils/enums';
import { useFormContext } from '../../context/FormContext';
import { FieldConfigProps, FieldOptionProps } from '../../utils/types';
import FieldOptions from '../Fields/FieldOptions';

import { camelCase } from 'lodash';

interface FieldModalProps {
  action: FieldActionsEnum;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  currentField?: any; // Field being edited or null for a new field
  setCurrentField: (field: any) => void;
}

const toCamelCase = (str: string) => {
  return camelCase(str.replace(/\s+/g, ''));
};

const FieldModal: React.FC<FieldModalProps> = ({
  action,
  isVisible,
  setIsVisible,
  currentField,
  setCurrentField,
}) => {
  const { state, dispatch } = useFormContext();
  const { formatMessage } = useIntl();

  const [hasAlert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(
    formatMessage({ id: getTranslation('required') })
  );

  const [label, setLabel] = useState(currentField?.label || '');
  const [placeholder, setPlaceholder] = useState(currentField?.placeholder || '');
  const [fieldType, setFieldType] = useState(currentField?.type || null);
  const [config, setConfig] = useState<FieldConfigProps>(currentField?.config || {});
  const [options, setOptions] = useState<FieldOptionProps[]>(currentField?.options || []);

  const isFilled = () => label && fieldType;

  const formatOptions = (content: string) => {
    setOptions(
      content.split('\n').map((option) => ({
        value: option,
        label: option,
      }))
    );
  };

  const isInvalid = () => {
    const currentStepFields =
      state.steps
        .find((step) => step.id === state.currentStep)
        ?.layouts.lg.flatMap((block) => block.field) || [];

    if (!currentStepFields.length && !currentField?.label) {
      return false;
    }

    return currentStepFields.some(
      (field) =>
        field &&
        field.label !== currentField?.label &&
        field.label.toLowerCase() === label.toLowerCase()
    );
  };

  const saveField = () => {
    setAlert(false);

    if (!isFilled() || isInvalid()) {
      setAlertMessage(
        formatMessage({
          id: getTranslation(isInvalid() ? 'exists' : 'required'),
        })
      );
      setAlert(true);
      return;
    }

    const payload = {
      label,
      placeholder,
      name: toCamelCase(label),
      type: fieldType,
      config,
      options: options,
    };

    if (action === FieldActionsEnum.Add) {
      // Add a new block with an initial field
      const newField = {
        i: `field-${Date.now()}`,
        ...payload,
      };

      dispatch({
        type: 'ADD_FIELD',
        payload: {
          currentStep: state.currentStep,
          field: newField,
        },
      });
    } else if (action === FieldActionsEnum.Edit) {
      // Dispatch an action to edit the field in the current block
      const updatedField = { ...currentField, ...payload };

      dispatch({
        type: 'EDIT_FIELD',
        payload: {
          currentStep: state.currentStep,
          blockId: currentField.blockId,
          field: updatedField,
        },
      });
    }

    closeModal();
  };

  const closeModal = () => {
    setIsVisible(false);
    setCurrentField(null);
  };

  return (
    <Modal.Root open={isVisible} onOpenChange={closeModal}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            {formatMessage({
              id:
                action === FieldActionsEnum.Add
                  ? getTranslation('forms.fields.add')
                  : getTranslation('forms.fields.edit'),
            })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {JSON.stringify(currentField)}
          <Flex direction="column" gap={4} alignItems="stretch" width="100%">
            <Field.Root name="type" id="type" error={hasAlert ? alertMessage : ''}>
              <Field.Label>
                {formatMessage({ id: getTranslation('forms.fields.type') })}
              </Field.Label>
              <SingleSelect
                value={fieldType}
                onChange={(value: string) => setFieldType(value)}
                placeholder={formatMessage({
                  id: getTranslation('forms.fields.type.placeholder'),
                })}
              >
                {Object.keys(FieldTypeEnum).map((key) => (
                  <SingleSelectOption key={key} value={key.toLowerCase()}>
                    {formatMessage({
                      id: getTranslation(`forms.fields.types.${key.toLowerCase()}`),
                    })}
                  </SingleSelectOption>
                ))}
              </SingleSelect>
              <Field.Error />
            </Field.Root>

            <Field.Root name="label" id="label" error={hasAlert ? alertMessage : ''}>
              <Field.Label>
                {formatMessage({ id: getTranslation('forms.fields.label') })}
              </Field.Label>
              <Field.Input
                id="field-label"
                value={label}
                onChange={(event: any) => setLabel(event.target.value)}
              />
              <Field.Error />
            </Field.Root>

            <Field.Root name="placeholder" id="placeholder">
              <Field.Label>
                {formatMessage({ id: getTranslation('forms.fields.placeholder') })}
              </Field.Label>
              <Field.Input
                id="field-placeholder"
                name="placeholder"
                value={placeholder}
                onChange={(event: any) => setPlaceholder(event.target.value)}
              />
            </Field.Root>

            {fieldType && (
              <>
                <Divider />
                <FieldOptions
                  field={fieldType!}
                  config={config}
                  setConfig={setConfig}
                  options={options.map((option) => option.value).join('\n')}
                  setOptions={formatOptions}
                />
              </>
            )}
          </Flex>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close>
            <Button variant="tertiary">{formatMessage({ id: getTranslation('cancel') })}</Button>
          </Modal.Close>
          <Button onClick={saveField}>{formatMessage({ id: getTranslation('save') })}</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default FieldModal;
