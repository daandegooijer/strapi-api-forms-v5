//@ts-nocheck
import { useIntl } from 'react-intl';
import { useEffect, useState } from 'react';
import formRequests from '../api/form';
import {
  Box,
  Grid,
  Flex,
  LinkButton,
  VisuallyHidden,
  Typography,
  Dialog,
} from '@strapi/design-system';
import { Mail, Pencil, Plus, Trash, WarningCircle } from '@strapi/icons';
import { useFormContext } from '../context/FormContext';
import { PLUGIN_ID } from '../pluginId';
import { getTranslation } from '../utils/getTranslation';
import {
  BackButton,
  Layouts,
  Page,
  Table,
  useAuth,
  useQueryParams,
  Pagination,
} from '@strapi/strapi/admin';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@strapi/design-system';
import { IconButton } from '@strapi/design-system';
import { IconButtonGroup } from '@strapi/design-system';
import ExportButton from '../components/ExportButton';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { formatMessage } = useIntl();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState([]);

  const token = useAuth('Admin', (state) => state.token);

  const [{ query }, querySet] = useQueryParams<{
    page?: number;
    pageSize?: number;
  }>({
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchForms = async () => {
      setIsFetching(true);
      try {
        const response = await formRequests.getForms(token, query);
        setResults(response.data);
        setPagination(response.meta?.pagination);
      } catch (error) {
        setResults([]);
        setPagination(null);
        setError(error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchForms();
  }, [navigate]);

  useEffect(() => {
    const fetchForms = async () => {
      setIsFetching(true);
      try {
        const response = await formRequests.getForms(token, query);
        setResults(response.data);
        setPagination(response.meta?.pagination);
      } catch (error) {
        setResults([]);
        setPagination(null);
        setError(error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchForms();
  }, [location.search]);

  const tableHeaders: any = [
    '#',
    formatMessage({
      id: getTranslation(`list.name`),
    }),
    formatMessage({
      id: getTranslation(`list.creation_date`),
    }),
    formatMessage({
      id: getTranslation(`list.submissions`),
    }),
    formatMessage({
      id: getTranslation(`list.handlers`),
    }),
    <VisuallyHidden>Actions</VisuallyHidden>,
  ];

  const handleDeleteClick = (row: any) => {
    setSelectedRow(row);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow && !token) {
      return;
    }

    try {
      await formRequests.deleteForm(token, selectedRow.documentId);
      setResults(results.filter((result) => result.id !== selectedRow.id));
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  if (isFetching) {
    return <Page.Loading />;
  }

  if (error) {
    return <Page.Error />;
  }

  return (
    <>
      <Layouts.Root>
        <Page.Title>{formatMessage({ id: getTranslation('heading.menu') })}</Page.Title>
        {/* @ts-ignore */}
        <Page.Main style={{ position: 'relative' }}>
          <Layouts.Header
            title={formatMessage({ id: getTranslation('forms.label') })}
            primaryAction={
              <LinkButton
                startIcon={<Plus style={{ fill: 'white' }} />}
                href={`/admin/plugins/${PLUGIN_ID}/form/add`}
              >
                {formatMessage({
                  id: getTranslation('forms.subtitle'),
                })}
              </LinkButton>
            }
            navigationAction={<BackButton disabled={undefined} />}
          />

          <Layouts.Content>
            <Grid.Root>
              <Grid.Item col={12} s={12}>
                <Box style={{ width: '100%' }}>
                  <Table.Root rows={results} headers={tableHeaders} isLoading={isFetching}>
                    <Table.Content>
                      <Table.Head>
                        {tableHeaders.map((header: any, index) => (
                          <Table.HeaderCell key={index} name={header} label={header} />
                        ))}
                      </Table.Head>
                      <Table.Loading />
                      <Table.Empty
                        action={
                          <LinkButton
                            startIcon={<Plus style={{ fill: 'white' }} />}
                            href={`/admin/plugins/${PLUGIN_ID}/form/add`}
                          >
                            {formatMessage({
                              id: getTranslation('forms.subtitle'),
                            })}
                          </LinkButton>
                        }
                      />
                      <Table.Body>
                        {results &&
                          results.map((row: any) => {
                            const formattedDate = new Intl.DateTimeFormat('nl-NL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              second: 'numeric',
                            }).format(new Date(row.createdAt));

                            return (
                              <Table.Row key={row.id}>
                                <Table.Cell>
                                  <Typography textColor="neutral800">{row.id}</Typography>
                                </Table.Cell>
                                <Table.Cell>
                                  <Typography textColor="neutral800">{row.title}</Typography>
                                </Table.Cell>
                                <Table.Cell>
                                  <Typography textColor="neutral800">{formattedDate}</Typography>
                                </Table.Cell>
                                <Table.Cell>
                                  <Flex gap={2} justifyContent="flex-start">
                                    <LinkButton
                                      disabled={row.submissions.length === 0}
                                      variant="secondary"
                                      href={`/admin/plugins/${PLUGIN_ID}/form/${row.documentId}/submissions`}
                                      startIcon={<Mail />}
                                    >
                                      {row.submissions.length}
                                    </LinkButton>
                                    <ExportButton disabled={row.submissions.length === 0} />
                                  </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                  <Flex gap={2} justifyContent="flex-start">
                                    {/* {Boolean(form.attributes?.notifications!.length) &&
                                      form.attributes?.notifications!.map((notification) => (
                                        <IconButton
                                          onClick={() =>
                                            openNotificationModal(
                                              form,
                                              notification.identifier as HandlerTypeEnum
                                            )
                                          }
                                          label={formatMessage({
                                            id: `${pluginId}.forms.fields.actions.${notification.identifier}`,
                                          })}
                                          icon={
                                            notification.identifier ===
                                            HandlerTypeEnum.Notification ? (
                                              <Bell />
                                            ) : (
                                              <Mail />
                                            )
                                          }
                                        />
                                      ))} */}
                                  </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                  <Flex gap={2} justifyContent="flex-end">
                                    <LinkButton
                                      href={`/admin/plugins/${PLUGIN_ID}/form/${row.documentId}`}
                                      startIcon={<Pencil />}
                                      style={{ fill: 'white', color: 'white' }}
                                    >
                                      {formatMessage({ id: getTranslation('actions.edit') })}
                                    </LinkButton>
                                    <LinkButton
                                      variant="danger"
                                      startIcon={<Trash />}
                                      onClick={() => handleDeleteClick(row)}
                                      style={{ fill: 'white', color: 'white' }}
                                    >
                                      {formatMessage({ id: getTranslation('actions.delete') })}
                                    </LinkButton>
                                  </Flex>
                                </Table.Cell>
                              </Table.Row>
                            );
                          })}
                      </Table.Body>
                    </Table.Content>
                  </Table.Root>
                  {
                    <Pagination.Root {...pagination} defaultPageSize={10}>
                      <Pagination.PageSize />
                      <Pagination.Links />
                    </Pagination.Root>
                  }
                </Box>
              </Grid.Item>
            </Grid.Root>
            <Dialog.Root open={isDialogOpen} onDismiss={() => setIsDialogOpen(false)}>
              <Dialog.Content>
                <Dialog.Header>
                  {formatMessage({ id: getTranslation('dialog.delete.text') })}
                </Dialog.Header>
                <Dialog.Body icon={<WarningCircle fill="danger600" />}>
                  {formatMessage({ id: getTranslation('dialog.delete.description') })}
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.Cancel>
                    <Button fullWidth variant="tertiary" onClick={() => setIsDialogOpen(false)}>
                      {formatMessage({ id: getTranslation('dialog.cancel') })}
                    </Button>
                  </Dialog.Cancel>
                  <Dialog.Action>
                    <Button fullWidth variant="danger-light" onClick={handleDeleteConfirm}>
                      {formatMessage({ id: getTranslation('dialog.confirm') })}
                    </Button>
                  </Dialog.Action>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Root>
          </Layouts.Content>
        </Page.Main>
      </Layouts.Root>
    </>
  );
};

export { HomePage };
