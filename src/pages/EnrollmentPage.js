import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/styles';

import {
  Form,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';
import EnrollmentHeadPanel from '../components/EnrollmentHeadPanel';
import { BENEFICIARY_STATUS } from '../constants';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function EnrollmentPage({
  rights,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage } = useTranslations('individual', modulesManager);

  const [editedEnrollment, setEditedEnrollment] = useState({
    status: Object.keys(BENEFICIARY_STATUS)[0],
  });

  const back = () => history.goBack();

  const actions = [];

  return (
    <div className={classes.page}>
      <Form
        key=""
        module="individual"
        title={formatMessage('individual.enrollment.title')}
        titleParams="Enrollment"
        edited={editedEnrollment}
        onEditedChanged={setEditedEnrollment}
        back={back}
        mandatoryFieldsEmpty={null}
        canSave={() => {}}
        save={null}
        HeadPanel={EnrollmentHeadPanel}
        rights={rights}
        actions={actions}
      />
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.payroll.submittingMutation,
});

export default connect(mapStateToProps, mapDispatchToProps)(EnrollmentPage);
