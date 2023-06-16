import React, { useEffect, useState, useRef } from 'react';
import { injectIntl } from 'react-intl';
import {
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  Searcher,
  withHistory,
  historyPush,
  downloadExport,
  coreConfirm,
  clearConfirm,
  journalize,
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
import { deleteGroup, downloadGroups, fetchGroups } from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  RIGHT_GROUP_UPDATE, RIGHT_GROUP_DELETE,
} from '../constants';
import GroupFilter from './GroupFilter';

function GroupSearcher({
  intl,
  modulesManager,
  history,
  rights,
  fetchGroups,
  fetchingGroups,
  fetchedGroups,
  errorGroups,
  groups,
  groupsPageInfo,
  groupsTotalCount,
  downloadGroups,
  groupsExport,
  errorGroupsExport,
  deleteGroup,
  confirmed,
  submittingMutation,
  mutation,
  coreConfirm,
  clearConfirm,
  journalize,
}) {
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [deletedGroupUuids, setDeletedGroupUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();

  function groupUpdatePageUrl(group) {
    return `${modulesManager.getRef('individual.route.group')}/${group?.id}`;
  }

  const openDeleteGroupConfirmDialog = () => coreConfirm(
    formatMessageWithValues(intl, 'individual', 'group.delete.confirm.title', {
      id: groupToDelete.id,
    }),
    formatMessage(intl, 'individual', 'group.delete.confirm.message'),
  );

  const onDoubleClick = (group, newTab = false) => rights.includes(RIGHT_GROUP_UPDATE)
  && !deletedGroupUuids.includes(group.id)
  && historyPush(modulesManager, history, 'individual.route.group', [group?.id], newTab);

  const onDelete = (group) => setGroupToDelete(group);

  useEffect(() => groupToDelete && openDeleteGroupConfirmDialog(), [groupToDelete]);

  useEffect(() => {
    if (groupToDelete && confirmed) {
      deleteGroup(
        groupToDelete,
        formatMessageWithValues(intl, 'individual', 'individual.delete.mutationLabel', {
          id: groupToDelete.id,
        }),
      );
      setDeletedGroupUuids([...deletedGroupUuids, groupToDelete.id]);
    }
    if (groupToDelete && confirmed !== null) {
      setGroupToDelete(null);
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

  const fetch = (params) => fetchGroups(params);

  const headers = () => {
    const headers = [
      'group.id',
    ];
    if (rights.includes(RIGHT_GROUP_UPDATE)) {
      headers.push('emptyLabel');
    }
    return headers;
  };

  const itemFormatters = () => {
    const formatters = [
      (group) => group.id,
    ];
    if (rights.includes(RIGHT_GROUP_UPDATE)) {
      formatters.push((group) => (
        <Tooltip title={formatMessage(intl, 'individual', 'editButtonTooltip')}>
          <IconButton
            href={groupUpdatePageUrl(group)}
            onClick={(e) => e.stopPropagation() && onDoubleClick(group)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    if (rights.includes(RIGHT_GROUP_DELETE)) {
      formatters.push((group) => (
        <Tooltip title={formatMessage(intl, 'individual', 'deleteButtonTooltip')}>
          <IconButton
            onClick={() => onDelete(group)}
            disabled={deletedGroupUuids.includes(group.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    return formatters;
  };

  const rowIdentifier = (group) => group.id;

  const sorts = () => [
    ['id', false],
  ];

  const isRowDisabled = (_, group) => deletedGroupUuids.includes(group.id);

  const defaultFilters = () => ({
    isDeleted: {
      value: false,
      filter: 'isDeleted: false',
    },
  });

  const [failedExport, setFailedExport] = useState(false);

  useEffect(() => {
    setFailedExport(true);
  }, [errorGroupsExport]);

  useEffect(() => {
    if (groupsExport) {
      downloadExport(groupsExport, `${formatMessage(intl, 'individual', 'export.filename')}.csv`)();
    }
  }, [groupsExport]);

  const groupFilter = (props) => (
    <GroupFilter
      intl={props.intl}
      classes={props.classes}
      filters={props.filters}
      onChangeFilters={props.onChangeFilters}
    />
  );

  return (
    <div>
      <Searcher
        module="individual"
        FilterPane={groupFilter}
        fetch={fetch}
        items={groups}
        itemsPageInfo={groupsPageInfo}
        fetchingItems={fetchingGroups}
        fetchedItems={fetchedGroups}
        errorItems={errorGroups}
        tableTitle={formatMessageWithValues(intl, 'individual', 'groups.searcherResultsTitle', {
          groupsTotalCount,
        })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="id"
        rowIdentifier={rowIdentifier}
        onDoubleClick={onDoubleClick}
        defaultFilters={defaultFilters()}
        exportable
        exportFetch={downloadGroups}
        exportFields={[
          'id',
          'group.id',
          'group.date_created',
          'json_ext', // Unfolded by backend and removed from csv
        ]}
        exportFieldsColumns={{
          id: 'ID',
          group__id: formatMessage(intl, 'individual', 'export.id'),
          group__date_created: formatMessage(intl, 'individual', 'export.dateCreated'),
        }}
        exportFieldLabel={formatMessage(intl, 'individual', 'export.label')}
        cacheFiltersKey="groupsFilterCache"
        rowDisabled={isRowDisabled}
        rowLocked={isRowDisabled}
      />
      {failedExport && (
        <Dialog fullWidth maxWidth="sm">
          <DialogTitle>{errorGroupsExport}</DialogTitle>
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
  fetchingGroups: state.individual.fetchingGroups,
  fetchedGroups: state.individual.fetchedGroups,
  errorGroups: state.individual.errorGroups,
  groups: state.individual.groups,
  groupsPageInfo: state.individual.groupsPageInfo,
  groupsTotalCount: state.individual.groupsTotalCount,
  selectedFilters: state.core.filtersCache.groupsFilterCache,
  fetchingGroupsExport: state.individual.fetchingGroupsExport,
  fetchedGroupsExport: state.individual.fetchedGroupsExport,
  groupsExport: state.individual.groupsExport,
  groupsExportPageInfo: state.individual.groupsExportPageInfo,
  errorGroupsExport: state.individual.errorGroupsExport,
  confirmed: state.core.confirmed,
  submittingMutation: state.individual.submittingMutation,
  mutation: state.individual.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchGroups,
    downloadGroups,
    deleteGroup,
    coreConfirm,
    clearConfirm,
    journalize,
  },
  dispatch,
);

export default withHistory(
  withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(GroupSearcher))),
);