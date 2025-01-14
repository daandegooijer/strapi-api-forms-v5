//@ts-nocheck
import { useIntl } from 'react-intl';
import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Flex,
  LinkButton,
  VisuallyHidden,
  Typography,
  Dialog,
} from '@strapi/design-system';
import { Pencil, Plus, Trash, WarningCircle } from '@strapi/icons';
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
import submissionRequests from '../api/submission';

const Submission = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { formatMessage } = useIntl();
  const { state, dispatch } = useFormContext();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState([]);

  const token = useAuth('Admin', (state) => state.token);

  if (!token) {
    return <Page.Loading />;
  }

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
        const response = await submissionRequests.getSubmissions(token, query);
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
        const response = await submissionRequests.getSubmissions(token, query);
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
    <VisuallyHidden>Actions</VisuallyHidden>,
  ];

  const handleClick = (row: any) => {
    setSelectedRow(row);
    setIsDialogOpen(true);
  };

  if (isFetching) {
    return <Page.Loading />;
  }
  console.log(error);
  if (error) {
    return <Page.Error />;
  }

  return (
    <>
      <Layouts.Root>
        <Page.Title>{formatMessage({ id: getTranslation('submissions.label') })}</Page.Title>
        {/* @ts-ignore */}
        <Page.Main style={{ position: 'relative' }}>
          <Layouts.Header
            title={formatMessage({ id: getTranslation('submissions.label') })}
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
                      <Table.Empty />
                      <Table.Body>
                        {results &&
                          results.map((row: any) => {
                            return (
                              <Table.Row key={row.id}>
                                <Table.Cell>
                                  <Typography textColor="neutral800">{row.id}</Typography>
                                </Table.Cell>
                                <Table.Cell>
                                  <Typography textColor="neutral800">{row.title}</Typography>
                                </Table.Cell>
                                <Table.Cell>
                                  <Typography textColor="neutral800">{row.createdAt}</Typography>
                                </Table.Cell>

                                <Table.Cell>
                                  {/* <Flex gap={2} justifyContent="flex-end">
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
                                      onClick={() => handleClick(row)}
                                      style={{ fill: 'white', color: 'white' }}
                                    >
                                      {formatMessage({ id: getTranslation('actions.delete') })}
                                    </LinkButton>
                                  </Flex> */}
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
            {/* <Dialog.Root open={isDialogOpen} onDismiss={() => setIsDialogOpen(false)}>
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
            </Dialog.Root> */}
          </Layouts.Content>
        </Page.Main>
      </Layouts.Root>
    </>
  );
};

export { Submission };
