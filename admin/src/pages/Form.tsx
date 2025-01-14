import { FormBuilder } from '../components/FormBuilder';
import { FormProvider, useFormContext } from '../context/FormContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { getTranslation } from '../utils/getTranslation';
import {
  Button,
  Box,
  DatePicker,
  Field,
  Grid,
  Textarea,
  Flex,
  Typography,
} from '@strapi/design-system';
import { useEffect, useState } from 'react';
import { Pencil } from '@strapi/icons';
import { format } from 'date-fns';
import { BackButton, Layouts, Page } from '@strapi/strapi/admin';
import AlertWrapper from '../components/Layout/AlertWrapper';
import { useAuth } from '@strapi/strapi/admin';
import formRequests from '../api/form';
import omit from 'lodash/omit';
import { PLUGIN_ID } from '../pluginId';

type FormParams = {
  id?: string;
};

const FormContent = () => {
  const history = useNavigate();
  const { formatMessage } = useIntl();
  const { id } = useParams<FormParams>();
  const token = useAuth('Admin', (state) => state.token);

  // context
  const { state, dispatch } = useFormContext();

  // states
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [showAlert, toggleAlert] = useState<boolean>(false);
  const [alertVariant, setAlertVariant] = useState<string>('success');
  const [alertMessage, setAlertMessage] = useState<string>('');

  const [initialFromDate, setInitialFromDate] = useState<string | null>(null);
  const [initialTillDate, setInitialTillDate] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);

      return;
    }

    formRequests
      .getForm(token!, id)
      .then((result) => {
        setInitialFromDate(result.dateFrom);
        setInitialTillDate(result.dateTill);

        dispatch({
          type: 'EDIT_FORM',
          payload: result,
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const onSave = async () => {
    if (!state.title || !state.steps || !state.successMessage || !state.errorMessage) {
      setAlertVariant('danger');
      return toggleAlert(true);
    }

    const data = omit(state, ['currentStep']);

    try {
      if (!id) {
        const response = await formRequests.submitForm(token!, data);
        return history(`/plugins/${PLUGIN_ID}/form/${response.data.documentId}`);
      }

      await formRequests.updateForm(token!, id, data);

      setAlertVariant('success');
      toggleAlert(true);
    } catch (error: any) {
      setAlertMessage(error.message);
      setAlertVariant('danger');
      return toggleAlert(true);
    }
  };

  if (isLoading) {
    return <Page.Loading />;
  }

  return (
    <Layouts.Root>
      <Page.Title>{formatMessage({ id: getTranslation('heading.menu') })}</Page.Title>
      {/* @ts-ignore */}
      <Page.Main style={{ position: 'relative' }}>
        {showAlert ? (
          <AlertWrapper variant={alertVariant} toggleAlert={toggleAlert} message={alertMessage} />
        ) : (
          <></>
        )}

        <Layouts.Header
          title={formatMessage({ id: getTranslation('heading.menu') })}
          subtitle={formatMessage({
            id: getTranslation(id ? 'heading.edit' : 'heading.add'),
          })}
          primaryAction={
            <Button onClick={onSave}>
              {formatMessage({
                id: getTranslation('save'),
              })}
            </Button>
          }
          navigationAction={<BackButton fallback={`/plugins/${PLUGIN_ID}`} disabled={false} />}
        />

        <Layouts.Content>
          <Box>
            <Box background="neutral0" padding={4} marginBottom={4} shadow="filterShadow" hasRadius>
              <Grid.Root gap={3}>
                <Grid.Item col={6} xs={12}>
                  <Field.Root name="title" required style={{ width: '100%' }}>
                    <Field.Label>
                      {formatMessage({ id: getTranslation(`forms.fields.title`) })}
                    </Field.Label>
                    <Field.Input
                      name="title"
                      type="text"
                      value={state.title}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        dispatch({
                          type: 'EDIT_FORM',
                          payload: {
                            title: event.currentTarget.value,
                          },
                        })
                      }
                    />
                  </Field.Root>
                </Grid.Item>
                <Grid.Item col={6} xs={12}>
                  <Grid.Root name="date" gap={2} style={{ width: '100%' }}>
                    <Grid.Item col={6} xs={6}>
                      <Field.Root style={{ width: '100%' }}>
                        <Field.Label>
                          {formatMessage({ id: getTranslation(`forms.fields.dateFrom`) })}
                        </Field.Label>
                        {initialFromDate ? (
                          <>
                            <Flex>
                              <Typography>{initialFromDate}</Typography>
                              <Pencil
                                style={{
                                  cursor: 'pointer',
                                  marginLeft: '10px',
                                  width: '0.75rem',
                                }}
                                onClick={() => setInitialFromDate(null)}
                                color="primary"
                              />
                            </Flex>
                          </>
                        ) : (
                          <DatePicker
                            locale="nl-NL"
                            minDate={new Date()}
                            label={formatMessage({ id: getTranslation(`forms.fields.dateFrom`) })}
                            onChange={(value: any) => {
                              if (!value) {
                                return;
                              }

                              const currentDate = new Date();
                              setInitialFromDate(null);

                              dispatch({
                                type: 'EDIT_FORM',
                                payload: {
                                  dateFrom: format(value, 'dd-MM-yyyy') + 'T00:00:00.000Z',
                                  active: currentDate >= value,
                                },
                              });
                            }}
                            onClear={() =>
                              dispatch({
                                type: 'EDIT_FORM',
                                payload: {
                                  dateFrom: null,
                                  active: true,
                                },
                              })
                            }
                          />
                        )}
                      </Field.Root>
                    </Grid.Item>

                    <Grid.Item col={6} xs={6}>
                      <Field.Root style={{ width: '100%' }}>
                        <Field.Label>
                          {formatMessage({ id: getTranslation(`forms.fields.dateTill`) })}
                        </Field.Label>
                        {initialTillDate ? (
                          <>
                            <Flex>
                              <Typography>{initialTillDate}</Typography>
                              <Pencil
                                style={{
                                  cursor: 'pointer',
                                  marginLeft: '10px',
                                  width: '0.75rem',
                                }}
                                onClick={() => setInitialTillDate(null)}
                                color="primary"
                              />
                            </Flex>
                          </>
                        ) : (
                          <DatePicker
                            locale="nl-NL"
                            minDate={new Date()}
                            label={formatMessage({ id: getTranslation(`forms.fields.dateTill`) })}
                            onChange={(value: any) => {
                              if (!value) {
                                return;
                              }

                              const currentDate = new Date();
                              setInitialTillDate(null);

                              dispatch({
                                type: 'EDIT_FORM',
                                payload: {
                                  dateTill: format(value, 'dd-MM-yyyy') + 'T00:00:00.000Z',
                                  active: currentDate > value,
                                },
                              });
                            }}
                            onClear={() =>
                              dispatch({
                                type: 'EDIT_FORM',
                                payload: {
                                  dateTill: null,
                                  active: true,
                                },
                              })
                            }
                          />
                        )}
                      </Field.Root>
                    </Grid.Item>
                  </Grid.Root>
                </Grid.Item>

                <Grid.Item padding={1} col={6} xs={6}>
                  <Field.Root name="successMessage" style={{ width: '100%' }}>
                    <Field.Label required>
                      {formatMessage({ id: getTranslation(`forms.fields.successMessage`) })}
                    </Field.Label>
                    <Textarea
                      name="successMessage"
                      type="text"
                      value={state.successMessage}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        dispatch({
                          type: 'EDIT_FORM',
                          payload: {
                            successMessage: event.currentTarget.value,
                          },
                        })
                      }
                    />
                  </Field.Root>
                </Grid.Item>
                <Grid.Item padding={1} col={6} xs={6}>
                  <Field.Root name="errorMessage" style={{ width: '100%' }}>
                    <Field.Label required>
                      {formatMessage({ id: getTranslation(`forms.fields.errorMessage`) })}
                    </Field.Label>
                    <Textarea
                      name="errorMessage"
                      type="text"
                      value={state.errorMessage}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        dispatch({
                          type: 'EDIT_FORM',
                          payload: {
                            errorMessage: event.currentTarget.value,
                          },
                        })
                      }
                    />
                  </Field.Root>
                </Grid.Item>
              </Grid.Root>
            </Box>
          </Box>
          <FormBuilder />
        </Layouts.Content>
      </Page.Main>
    </Layouts.Root>
  );
};

const Form = () => (
  <FormProvider>
    <FormContent />
  </FormProvider>
);

export { Form };
