//@ts-nocheck
import { useIntl } from 'react-intl';
import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Grid,
  LinkButton,
  Modal,
  Typography,
  VisuallyHidden,
} from '@strapi/design-system';
import { Eye, File } from '@strapi/icons';
import { PLUGIN_ID } from '../pluginId';
import { getTranslation } from '../utils/getTranslation';
import {
  BackButton,
  Layouts,
  Page,
  Pagination,
  Table,
  useAuth,
  useQueryParams,
} from '@strapi/strapi/admin';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import submissionRequests from '../api/submission';

const Submission = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const truncateValue = (value, maxLength = 100) => {
    if (typeof value === 'string' && value.length > maxLength) {
      return value.substring(0, maxLength) + '...'; // Truncate and add ellipsis
    }
    return value;
  };

  const handleOpenModal = (submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  const { formatMessage } = useIntl();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

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
        console.log(response);
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
      id: getTranslation(`submission.title`),
    }),
    formatMessage({
      id: getTranslation(`list.creation_date`),
    }),
    <VisuallyHidden>Actions</VisuallyHidden>,
  ];

  if (isFetching) {
    return <Page.Loading />;
  }

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
            secondaryAction={
              <LinkButton
                variant="tertiary"
                startIcon={<File />}
                to={`/plugins/${PLUGIN_ID}`}
                tag={NavLink}
              >
                {formatMessage({ id: getTranslation('forms.all') })}
              </LinkButton>
            }
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
                            const creationDate = new Intl.DateTimeFormat('nl-NL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              second: 'numeric',
                            }).format(new Date(row.publishedAt));

                            const submission = Object.entries(row.submission).map(
                              (value, key) => `${value.join(': ')}  `
                            );

                            console.log(submission);

                            return (
                              <Table.Row key={row.id}>
                                <Table.Cell>
                                  <Typography textColor="neutral800">{row.id}</Typography>
                                </Table.Cell>
                                <Table.Cell>
                                  <Typography textColor="neutral800">
                                    <div>{truncateValue(submission.join(' - '))}</div>
                                  </Typography>
                                </Table.Cell>
                                <Table.Cell>
                                  <Typography textColor="neutral800">{creationDate}</Typography>
                                </Table.Cell>

                                <Table.Cell>
                                  <LinkButton
                                    variant="secondary"
                                    onClick={() => handleOpenModal(row)}
                                  >
                                    <Flex gap={2} justifyContent="flex-start" alignItems="center">
                                      <Eye />
                                      View details
                                    </Flex>
                                  </LinkButton>
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
            <Modal.Root open={isModalOpen && selectedSubmission} onClose={handleCloseModal}>
              <Modal.Content>
                <Modal.Header>
                  <Typography variant="beta">Submission Details</Typography>
                </Modal.Header>
                <Modal.Body>
                  {selectedSubmission?.submission && (
                    <Box padding={0}>
                      <Box background="neutral100" padding={4} shadow="tableShadow" hasRadius>
                        {Object.entries(selectedSubmission.submission).map(([key, value]) => (
                          <Flex
                            key={key}
                            marginBottom={4}
                            justifyContent="space-between"
                            alignItems="flex-start"
                            wrap="wrap"
                          >
                            {/* Key */}
                            <Typography
                              fontWeight="bold"
                              textColor="neutral800"
                              style={{ flex: 1, maxWidth: '200px' }}
                            >
                              {key}:
                            </Typography>
                            {/* Value */}
                            <Typography textColor="neutral800" style={{ flex: 2 }}>
                              {typeof value === 'object' ? (
                                <pre
                                  style={{
                                    margin: 0,
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word',
                                  }}
                                >
                                  {JSON.stringify(value, null, 2)}
                                </pre>
                              ) : (
                                value || 'N/A'
                              )}
                            </Typography>
                          </Flex>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Modal.Body>
              </Modal.Content>
            </Modal.Root>
          </Layouts.Content>
        </Page.Main>
      </Layouts.Root>
    </>
  );
};

export { Submission };
