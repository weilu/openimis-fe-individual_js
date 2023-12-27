import React from 'react';
import { injectIntl } from 'react-intl';
import {
  withModulesManager,
  formatMessageWithValues,
  Searcher,
  formatDateFromISO,
  withHistory,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchIndividualHistory } from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  EMPTY_STRING,
} from '../constants';

function IndividualHistorySearcher({
  intl,
  modulesManager,
  individualHistory,
  fetchIndividualHistory,
  individualHistoryPageInfo,
  fetchingIndividualHistory,
  fetchedIndividualHistory,
  errorIndividualHistory,
  individualHistoryTotalCount,
  individualId,
}) {
  const fetch = () => fetchIndividualHistory(individualId);

  const headers = () => {
    const headers = [
      'individualHistory.firstName',
      'individualHistory.lastName',
      'individualHistory.dob',
      'individualHistory.jsonExt',
    ];
    return headers;
  };

  const itemFormatters = () => {
    const formatters = [
      (individualHistory) => individualHistory.firstName,
      (individualHistory) => individualHistory.lastName,
      (individualHistory) => (individualHistory.dob ?
        formatDateFromISO(modulesManager, intl, individualHistory.dob) : EMPTY_STRING
      ),
    ];
    return formatters;
  };

  const rowIdentifier = (individualHistory) => individualHistory.id;

  const sorts = () => [
    ['firstName', true],
    ['lastName', true],
    ['dob', true],
  ];

  const defaultFilters = () => {
    const filters = {
      isDeleted: {
        value: false,
        filter: 'isDeleted: false',
      },
    };
    if (individualId !== null && individualId !== undefined) {
      filters.individualId = {
        value: individualId,
        filter: `id: "${individualId}"`,
      };
    }
    return filters;
  };

  return (
    <div>
      <Searcher
        module="individual"
        fetch={fetch}
        items={individualHistory}
        itemsPageInfo={individualHistoryPageInfo}
        fetchingItems={fetchingIndividualHistory}
        fetchedItems={fetchedIndividualHistory}
        errorItems={errorIndividualHistory}
        tableTitle={formatMessageWithValues(intl, 'individual', 'individualHistoryList.searcherResultsTitle', {
          individualHistoryTotalCount,
        })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="lastName"
        rowIdentifier={rowIdentifier}
        defaultFilters={defaultFilters()}
        cacheFiltersKey="individualsFilterCache"
        resetFiltersOnUnmount
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  fetchingIndividualHistory: state.individual.fetchingIndividualHistory,
  fetchedIndividualHistory: state.individual.fetchedIndividualHistory,
  errorIndividualHistory: state.individual.errorIndividualHistory,
  individualHistory: state.individual.individualHistory,
  individualHistoryPageInfo: state.individual.individualHistoryPageInfo,
  individualHistoryTotalCount: state.individual.individualHistoryTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchIndividualHistory,
  },
  dispatch,
);

export default withHistory(
  withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(IndividualHistorySearcher))),
);
