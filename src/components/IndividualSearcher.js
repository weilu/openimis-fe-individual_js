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
  CLEARED_STATE_FILTER,
  decodeId,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect, useDispatch } from 'react-redux';
import {
  IconButton, Tooltip, Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import UndoIcon from '@material-ui/icons/Undo';
import {
  fetchIndividuals,
  deleteIndividual,
  downloadIndividuals,
  clearIndividualExport,
  undoDeleteIndividual,
} from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  EMPTY_STRING,
  RIGHT_INDIVIDUAL_UPDATE,
  RIGHT_INDIVIDUAL_DELETE,
  RIGHT_SCHEMA_SEARCH,
  FETCH_BENEFIT_PLAN_SCHEMA_FIELDS_REF,
  INDIVIDUAL_MODULE_NAME,
  INDIVIDUAL_LABEL,
  INDIVIDUALS_UPLOAD_FORM_CONTRIBUTION_KEY,
} from '../constants';
import IndividualFilter from './IndividualFilter';
import {
  applyNumberCircle,
  LOC_LEVELS,
  locationAtLevel,
} from '../util/searcher-utils';

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
  clearIndividualExport,
  groupId,
  downloadIndividuals,
  individualExport,
  errorIndividualExport,
  fieldsFromBfSchema,
  fetchingFieldsFromBfSchema,
  fetchedFieldsFromBfSchema,
  isModalEnrollment,
  advancedCriteria,
  benefitPlanToEnroll,
  undoDeleteIndividual,
}) {
  const dispatch = useDispatch();
  const [individualToDelete, setIndividualToDelete] = useState(null);
  const [individualToUndo, setIndividualToUndo] = useState(null);
  const [appliedCustomFilters, setAppliedCustomFilters] = useState([CLEARED_STATE_FILTER]);
  const [appliedFiltersRowStructure, setAppliedFiltersRowStructure] = useState([CLEARED_STATE_FILTER]);
  const [deletedIndividualUuids, setDeletedIndividualUuids] = useState([]);
  const [undoIndividualUuids, setUndoIndividualUuids] = useState([]);
  const [exportFields, setExportFields] = useState([
    'id',
    'first_name',
    'last_name',
    'dob',
  ]);
  const exportFieldsColumns = {
    id: 'ID',
    first_name: formatMessage(intl, 'individual', 'export.firstName'),
    last_name: formatMessage(intl, 'individual', 'export.lastName'),
    dob: formatMessage(intl, 'individual', 'export.dob'),
  };
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    const canFetchBenefitPlanSchemaFields = !fetchedFieldsFromBfSchema
        && !fetchingFieldsFromBfSchema
        && rights.includes(RIGHT_SCHEMA_SEARCH);

    if (canFetchBenefitPlanSchemaFields) {
      const fetchBenefitPlanSchemaFields = modulesManager.getRef(FETCH_BENEFIT_PLAN_SCHEMA_FIELDS_REF);
      if (fetchBenefitPlanSchemaFields) {
        dispatch(fetchBenefitPlanSchemaFields(['bfType: INDIVIDUAL']));
      }
    }

    if (!canFetchBenefitPlanSchemaFields) {
      setExportFields([...exportFields, ...fieldsFromBfSchema]);
    }
  }, [fetchedFieldsFromBfSchema, fetchingFieldsFromBfSchema, rights, modulesManager]);

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

  const openUndoIndividualConfirmDialog = () => coreConfirm(
    formatMessageWithValues(intl, 'individual', 'individual.undo.confirm.title', {
      firstName: individualToUndo.firstName,
      lastName: individualToUndo.lastName,
    }),
    formatMessage(intl, 'individual', 'individual.undo.confirm.message'),
  );

  const onDoubleClick = (individual, newTab = false) => rights.includes(RIGHT_INDIVIDUAL_UPDATE)
  && !deletedIndividualUuids.includes(individual.id)
  && historyPush(modulesManager, history, 'individual.route.individual', [individual?.id], newTab);

  const onDelete = (individual) => setIndividualToDelete(individual);
  const onUndo = (individual) => setIndividualToUndo(individual);

  useEffect(() => individualToDelete && openDeleteIndividualConfirmDialog(), [individualToDelete]);
  useEffect(() => individualToUndo && openUndoIndividualConfirmDialog(), [individualToUndo]);

  useEffect(() => {
    if (individualToDelete && confirmed) {
      deleteIndividual(
        individualToDelete,
        formatMessageWithValues(intl, 'individual', 'individual.delete.mutationLabel', {
          id: individualToDelete?.id,
        }),
      );
      setDeletedIndividualUuids([...deletedIndividualUuids, individualToDelete.id]);
    }
    if (individualToUndo && confirmed) {
      undoDeleteIndividual(
        individualToUndo,
        formatMessageWithValues(intl, 'individual', 'individual.undo.mutationLabel', {
          id: individualToUndo?.id,
        }),
      );
      setUndoIndividualUuids([...undoIndividualUuids, individualToUndo.id]);
    }
    if (individualToDelete && confirmed !== null) {
      setIndividualToDelete(null);
    }
    if (individualToUndo && confirmed !== null) {
      setIndividualToUndo(null);
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

  const fetch = (params) => fetchIndividuals(modulesManager, params);

  const headers = () => {
    const headers = [
      'individual.firstName',
      'individual.lastName',
      'individual.dob',
    ];

    headers.push(...Array.from({ length: LOC_LEVELS }, (_, i) => `location.locationType.${i}`));

    if (rights.includes(RIGHT_INDIVIDUAL_UPDATE)) {
      headers.push('emptyLabel');
    }
    if (rights.includes(RIGHT_INDIVIDUAL_DELETE)) {
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

    const locations = Array.from({ length: LOC_LEVELS }, (_, i) => (group) => (
      locationAtLevel(group.location, LOC_LEVELS - i - 1)
    ));
    formatters.push(...locations);

    if (rights.includes(RIGHT_INDIVIDUAL_UPDATE) && isModalEnrollment === false) {
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
    if (rights.includes(RIGHT_INDIVIDUAL_DELETE) && isModalEnrollment === false) {
      formatters.push((individual) => (!individual?.isDeleted ? (
        <Tooltip title={formatMessage(intl, INDIVIDUAL_MODULE_NAME, 'deleteButtonTooltip')}>
          <IconButton
            onClick={() => onDelete(individual)}
            disabled={deletedIndividualUuids.includes(individual.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title={formatMessage(intl, INDIVIDUAL_MODULE_NAME, 'undoButtonTooltip')}>
          <IconButton
            onClick={() => onUndo(individual)}
            disabled={undoIndividualUuids.includes(individual.id)}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
      )));
    }
    return formatters;
  };

  const rowIdentifier = (individual) => individual.id;

  const sorts = () => [
    ['firstName', true],
    ['lastName', true],
    ['dob', true],
  ];

  const isRowDisabled = (_, individual) => deletedIndividualUuids.includes(individual.id)
      || undoIndividualUuids.includes(individual.id);

  const [failedExport, setFailedExport] = useState(false);

  useEffect(() => {
    if (errorIndividualExport) {
      setFailedExport(true);
    }
  }, [errorIndividualExport]);

  useEffect(() => {
    if (individualExport) {
      downloadExport(individualExport, `${formatMessage(intl, 'individual', 'export.filename.individuals')}.csv`)();
      clearIndividualExport();
    }

    return setFailedExport(false);
  }, [individualExport]);

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
    if (isModalEnrollment && advancedCriteria !== null && advancedCriteria !== undefined) {
      filters.customFilters = {
        value: advancedCriteria,
        filter: `customFilters: [${advancedCriteria}]`,
      };
      filters.benefitPlanToEnroll = {
        value: benefitPlanToEnroll,
        filter: `benefitPlanToEnroll: "${decodeId(benefitPlanToEnroll)}"`,
      };
      filters.filterNotAttachedToGroup = {
        value: true,
        filter: `filterNotAttachedToGroup: true`,
      };
    }
    return filters;
  };

  useEffect(() => {
    // refresh when appliedCustomFilters is changed
  }, [appliedCustomFilters]);

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
        isCustomFiltering
        moduleName={INDIVIDUAL_MODULE_NAME}
        objectType={INDIVIDUAL_LABEL}
        additionalCustomFilterParams={{ type: 'INDIVIDUAL' }}
        appliedCustomFilters={appliedCustomFilters}
        setAppliedCustomFilters={setAppliedCustomFilters}
        appliedFiltersRowStructure={appliedFiltersRowStructure}
        setAppliedFiltersRowStructure={setAppliedFiltersRowStructure}
        applyNumberCircle={applyNumberCircle}
        exportFields={exportFields}
        exportFieldsColumns={exportFieldsColumns}
        exportFieldLabel={formatMessage(intl, 'individual', 'export.label')}
        chooseExportableColumns
        cacheFiltersKey="individualsFilterCache"
        resetFiltersOnUnmount
        // eslint-disable-next-line react/jsx-props-no-spreading, max-len
        {...(isModalEnrollment === false ? {
          actionsContributionKey: INDIVIDUALS_UPLOAD_FORM_CONTRIBUTION_KEY, isCustomFiltering: true,
        } : { isCustomFiltering: false })}
      />
      {failedExport && (
        <Dialog open={failedExport} fullWidth maxWidth="sm">
          <DialogTitle>{errorIndividualExport?.message}</DialogTitle>
          <DialogContent>
            <strong>{`${errorIndividualExport?.code}: `}</strong>
            {errorIndividualExport?.detail}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFailedExport(false)} color="primary" variant="contained">
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
  fetchingIndividualExport: state.individual.fetchingIndividualsExport,
  fetchedIndividualExport: state.individual.fetchedIndividualExport,
  individualExport: state.individual.individualExport,
  individualExportPageInfo: state.individual.individualExportPageInfo,
  errorIndividualExport: state.individual.errorIndividualExport,
  fieldsFromBfSchema: state?.socialProtection?.fieldsFromBfSchema,
  fetchingFieldsFromBfSchema: state?.socialProtection?.fetchingFieldsFromBfSchema,
  fetchedFieldsFromBfSchema: state?.socialProtection?.fetchedFieldsFromBfSchema,
  errorFieldsFromBfSchema: state?.socialProtection?.errorFieldsFromBfSchema,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchIndividuals,
    deleteIndividual,
    downloadIndividuals,
    clearIndividualExport,
    undoDeleteIndividual,
    coreConfirm,
    clearConfirm,
    journalize,
  },
  dispatch,
);

export default withHistory(
  withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(IndividualSearcher))),
);
