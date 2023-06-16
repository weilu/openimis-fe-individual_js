import React, { useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import {
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  Searcher,
  formatDateFromISO,
  coreConfirm,
  clearConfirm,
  journalize,
  withHistory,
  historyPush,
  downloadExport,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  IconButton, Tooltip, Button,
  Dialog,
  DialogActions,
  DialogTitle,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { fetchIndividuals, deleteIndividual, downloadIndividuals } from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  EMPTY_STRING,
  RIGHT_INDIVIDUAL_UPDATE,
  RIGHT_INDIVIDUAL_DELETE,
} from '../constants';
import IndividualFilter from './IndividualFilter';

function IndividualSearcher({
  intl,
  modulesManager,
  history,
  rights,
  coreConfirm,
  clearConfirm,
  confirmed,
  journalize,
  submittingMutation,
  mutation,
  fetchIndividuals,
  deleteIndividual,
  fetchingIndividuals,
  fetchedIndividuals,
  errorIndividuals,
  individuals,
  individualsPageInfo,
  individualsTotalCount,
  groupId,
  downloadIndividuals,
  individualsExport,
  errorIndividualsExport,
}) {
  const [individualToDelete, setIndividualToDelete] = useState(null);
  const [deletedIndividualUuids, setDeletedIndividualUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();

  function individualUpdatePageUrl(individual) {
    return `${modulesManager.getRef('individual.route.individual')}/${individual?.id}`;
  }

  const openDeleteIndividualConfirmDialog = () => coreConfirm(
    formatMessageWithValues(intl, 'individual', 'individual.delete.confirm.title', {
      firstName: individualToDelete.firstName,
      lastName: individualToDelete.lastName,
    }),
    formatMessage(intl, 'individual', 'individual.delete.confirm.message'),
  );

  const onDoubleClick = (individual, newTab = false) => rights.includes(RIGHT_INDIVIDUAL_UPDATE)
  && !deletedIndividualUuids.includes(individual.id)
  && historyPush(modulesManager, history, 'individual.route.individual', [individual?.id], newTab);

  const onDelete = (individual) => setIndividualToDelete(individual);

  useEffect(() => individualToDelete && openDeleteIndividualConfirmDialog(), [individualToDelete]);

  useEffect(() => {
    if (individualToDelete && confirmed) {
      deleteIndividual(
        individualToDelete,
        formatMessageWithValues(intl, 'individual', 'individual.delete.mutationLabel', {
          firstName: individualToDelete.firstName,
          lastName: individualToDelete.lastName,
        }),
      );
      setDeletedIndividualUuids([...deletedIndividualUuids, individualToDelete.id]);
    }
    if (individualToDelete && confirmed !== null) {
      setIndividualToDelete(null);
    }
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const fetch = (params) => fetchIndividuals(params);

  const headers = () => {
    const headers = [
      'individual.firstName',
      'individual.lastName',
      'individual.dob',
    ];
    if (rights.includes(RIGHT_INDIVIDUAL_UPDATE)) {
      headers.push('emptyLabel');
    }
    return headers;
  };

  const itemFormatters = () => {
    const formatters = [
      (individual) => individual.firstName,
      (individual) => individual.lastName,
      (individual) => (individual.dob ? formatDateFromISO(modulesManager, intl, individual.dob) : EMPTY_STRING),
    ];
    if (rights.includes(RIGHT_INDIVIDUAL_UPDATE)) {
      formatters.push((individual) => (
        <Tooltip title={formatMessage(intl, 'individual', 'editButtonTooltip')}>
          <IconButton
            href={individualUpdatePageUrl(individual)}
            onClick={(e) => e.stopPropagation() && onDoubleClick(individual)}
            disabled={deletedIndividualUuids.includes(individual.id)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    if (rights.includes(RIGHT_INDIVIDUAL_DELETE)) {
      formatters.push((individual) => (
        <Tooltip title={formatMessage(intl, 'individual', 'deleteButtonTooltip')}>
          <IconButton
            onClick={() => onDelete(individual)}
            disabled={deletedIndividualUuids.includes(individual.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    return formatters;
  };

  const rowIdentifier = (individual) => individual.id;

  const sorts = () => [
    ['firstName', true],
    ['lastName', true],
    ['dob', true],
  ];

  const isRowDisabled = (_, individual) => deletedIndividualUuids.includes(individual.id);

  const [failedExport, setFailedExport] = useState(false);

  useEffect(() => {
    setFailedExport(true);
  }, [errorIndividualsExport]);

  useEffect(() => {
    if (individualsExport) {
      downloadExport(individualsExport, `${formatMessage(intl, 'individual', 'export.filename')}.csv`)();
    }
  }, [individualsExport]);

  const defaultFilters = () => {
    const filters = {
      isDeleted: {
        value: false,
        filter: 'isDeleted: false',
      },
    };
    if (groupId !== null && groupId !== undefined) {
      filters.groupId = {
        value: groupId,
        filter: `groupId: "${groupId}"`,
      };
    }
    return filters;
  };

  return (
    <div>
      <Searcher
        module="individual"
        FilterPane={IndividualFilter}
        fetch={fetch}
        items={individuals}
        itemsPageInfo={individualsPageInfo}
        fetchingItems={fetchingIndividuals}
        fetchedItems={fetchedIndividuals}
        errorItems={errorIndividuals}
        tableTitle={formatMessageWithValues(intl, 'individual', 'individuals.searcherResultsTitle', {
          individualsTotalCount,
        })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="lastName"
        rowIdentifier={rowIdentifier}
        onDoubleClick={onDoubleClick}
        defaultFilters={defaultFilters()}
        rowDisabled={isRowDisabled}
        rowLocked={isRowDisabled}
        exportable
        exportFetch={downloadIndividuals}
        exportFields={[
          'id',
          'first_name',
          'last_name',
          'dob',
          'json_ext', // Unfolded by backend and removed from csv
        ]}
        exportFieldsColumns={{
          id: 'ID',
          first_name: formatMessage(intl, 'individual', 'export.firstName'),
          last_name: formatMessage(intl, 'individual', 'export.lastName'),
          dob: formatMessage(intl, 'individual', 'export.dob'),
        }}
        exportFieldLabel={formatMessage(intl, 'individual', 'export.label')}
        cacheFiltersKey="individualsFilterCache"
      />
      {failedExport && (
        <Dialog fullWidth maxWidth="sm">
          <DialogTitle>{errorIndividualsExport}</DialogTitle>
          <DialogActions>
            <Button onClick={setFailedExport(false)} variant="contained">
              {formatMessage(intl, 'individual', 'ok')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  fetchingIndividuals: state.individual.fetchingIndividuals,
  fetchedIndividuals: state.individual.fetchedIndividuals,
  errorIndividuals: state.individual.errorIndividuals,
  individuals: state.individual.individuals,
  individualsPageInfo: state.individual.individualsPageInfo,
  individualsTotalCount: state.individual.individualsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.individual.submittingMutation,
  mutation: state.individual.mutation,
  selectedFilters: state.core.filtersCache.individualsFilterCache,
  fetchingIndividualsExport: state.individual.fetchingIndividualsExport,
  fetchedIndividualsExport: state.individual.fetchedIndividualsExport,
  individualsExport: state.individual.individualsExport,
  individualsExportPageInfo: state.individual.individualsExportPageInfo,
  errorIndividualsExport: state.individual.errorIndividualsExport,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchIndividuals,
    deleteIndividual,
    downloadIndividuals,
    coreConfirm,
    clearConfirm,
    journalize,
  },
  dispatch,
);

export default withHistory(
  withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(IndividualSearcher))),
);
