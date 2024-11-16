import React from 'react';
import { injectIntl } from 'react-intl';
import {
  ControlledField,
  PublishedComponent,
  TextInput,
} from '@openimis/fe-core';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import { DEFAULT_DEBOUNCE_TIME, EMPTY_STRING } from '../constants';
import { defaultFilterStyles } from '../util/styles';

function GroupFilter({
  classes, filters, onChangeFilters,
}) {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);

  const filterTextFieldValue = (filterName) => filters?.[filterName]?.value ?? EMPTY_STRING;

  const onChangeStringFilter = (filterName) => (value) => {
    debouncedOnChangeFilters([
      {
        id: filterName,
        value,
        filter: `${filterName}: "${value}"`,
      },
    ]);
  };

  return (
    <Grid container className={classes.form}>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="individual"
          label="group.code"
          value={filterTextFieldValue('code_Icontains')}
          onChange={onChangeStringFilter('code_Icontains')}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="individual"
          label="group.individual.firstName"
          value={filterTextFieldValue('firstName')}
          onChange={onChangeStringFilter('firstName')}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="individual"
          label="group.individual.lastName"
          value={filterTextFieldValue('lastName')}
          onChange={onChangeStringFilter('lastName')}
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

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(GroupFilter)));
