import React from 'react';
import { injectIntl } from 'react-intl';
import {
  ControlledField,
  PublishedComponent,
  TextInput,
  formatMessage,
} from '@openimis/fe-core';
import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import {
  CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING, INDIVIDUAL_MODULE_NAME,
} from '../constants';
import { defaultFilterStyles } from '../util/styles';

function IndividualFilter({
  intl, classes, filters, onChangeFilters,
}) {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);

  const filterValue = (k) => (!!filters && !!filters[k] ? filters[k].value : null);

  const filterTextFieldValue = (filterName) => filters?.[filterName]?.value ?? EMPTY_STRING;

  const onChangeStringFilter = (filterName, lookup = null) => (value) => {
    if (lookup) {
      debouncedOnChangeFilters([
        {
          id: filterName,
          value,
          filter: `${filterName}_${lookup}: "${value}"`,
        },
      ]);
    } else {
      onChangeFilters([
        {
          id: filterName,
          value,
          filter: `${filterName}: "${value}"`,
        },
      ]);
    }
  };

  const onChangeFilter = (k, v) => {
    onChangeFilters([
      {
        id: k,
        value: v,
        filter: `${k}: ${v}`,
      },
    ]);
  };

  return (
    <Grid container className={classes.form}>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module={INDIVIDUAL_MODULE_NAME}
          label="individual.firstName"
          value={filterTextFieldValue('firstName')}
          onChange={onChangeStringFilter('firstName', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module={INDIVIDUAL_MODULE_NAME}
          label="individual.lastName"
          value={filterTextFieldValue('lastName')}
          onChange={onChangeStringFilter('lastName', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module={INDIVIDUAL_MODULE_NAME}
          label="individual.dob"
          value={filterValue('dob')}
          onChange={(v) => onChangeFilters([
            {
              id: 'dob',
              value: v,
              filter: `dob: "${v}"`,
            },
          ])}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <FormControlLabel
          control={(
            <Checkbox
              checked={filterValue('isDeleted')}
              onChange={(event) => onChangeFilter('isDeleted', event.target.checked)}
              name="isDeleted"
            />
            )}
          label={formatMessage(intl, INDIVIDUAL_MODULE_NAME, 'isDeleted')}
        />
      </Grid>
      <ControlledField
        module="individual"
        id="GroupFilter.location"
        field={(
          <Grid item xs={12}>
            <PublishedComponent
              pubRef="location.DetailedLocationFilter"
              withNull
              filters={filters}
              onChangeFilters={onChangeFilters}
              anchor="parentLocation"
            />
          </Grid>
        )}
      />
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(IndividualFilter)));
