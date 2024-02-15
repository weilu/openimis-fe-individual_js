/* eslint-disable camelcase */
import React from 'react';
import { injectIntl } from 'react-intl';

import { Grid } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

import {
  decodeId,
  FormPanel,
  PublishedComponent,
  withModulesManager,
} from '@openimis/fe-core';
import AdvancedCriteriaDialog from './dialogs/AdvancedCriteriaDialog';
import { CLEARED_STATE_FILTER } from '../constants';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class EnrollmentHeadPanel extends FormPanel {
  constructor(props) {
    super(props);
    this.state = {
      appliedCustomFilters: [CLEARED_STATE_FILTER],
      appliedFiltersRowStructure: [CLEARED_STATE_FILTER],
    };
  }

  updateJsonExt = (value) => {
    this.updateAttributes({
      jsonExt: value,
    });
  };

  getDefaultAppliedCustomFilters = () => {
    const { jsonExt } = this.props?.edited ?? {};
    try {
      const jsonData = JSON.parse(jsonExt);
      const advancedCriteria = jsonData.advanced_criteria || [];
      return advancedCriteria.map(({ custom_filter_condition }) => {
        const [field, filter, typeValue] = custom_filter_condition.split('__');
        const [type, value] = typeValue.split('=');
        return {
          custom_filter_condition,
          field,
          filter,
          type,
          value,
        };
      });
    } catch (error) {
      return [];
    }
  };

  setAppliedCustomFilters = (appliedCustomFilters) => {
    this.setState({ appliedCustomFilters });
  };

  setAppliedFiltersRowStructure = (appliedFiltersRowStructure) => {
    this.setState({ appliedFiltersRowStructure });
  };

  render() {
    const { edited, classes, intl } = this.props;
    const enrollment = { ...edited };
    const { appliedCustomFilters, appliedFiltersRowStructure } = this.state;
    return (
      <>
        <AdvancedCriteriaDialog
          object={enrollment.benefitPlan}
          objectToSave={enrollment}
          moduleName="individual"
          objectType="Individual"
          setAppliedCustomFilters={this.setAppliedCustomFilters}
          appliedCustomFilters={appliedCustomFilters}
          appliedFiltersRowStructure={appliedFiltersRowStructure}
          setAppliedFiltersRowStructure={this.setAppliedFiltersRowStructure}
          updateAttributes={this.updateJsonExt}
          getDefaultAppliedCustomFilters={this.getDefaultAppliedCustomFilters}
          additionalParams={enrollment?.benefitPlan ? { benefitPlan: `${decodeId(enrollment.benefitPlan.id)}` } : null}
        />
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="socialProtection.BenefitPlanPicker"
              withNull
              required
              filterLabels={false}
              onChange={(benefitPlan) => this.updateAttribute('benefitPlan', benefitPlan)}
              value={enrollment?.benefitPlan}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="socialProtection.BeneficiaryStatusPicker"
              required
              filterLabels={false}
              onChange={(status) => this.updateAttribute('status', status)}
              value={enrollment?.status}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(EnrollmentHeadPanel))));
