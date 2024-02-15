import React, { useState, useRef, useEffect } from 'react';
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

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function EnrollmentPage({
  rights,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations('individual', modulesManager);

  const [editedEnrollment, setEditedEnrollment] = useState({});

  const back = () => history.goBack();

  const actions = [];

  return (
    <div className={classes.page}>
      <Form
        key=""
        module="payroll"
        title="Enrollment of Individuals to the Programme"
        titleParams="Enrollment"
        edited={editedEnrollment}
        onEditedChanged={setEditedEnrollment}
        back={back}
        mandatoryFieldsEmpty={null}
        canSave={() => {}}
        save={() => {}}
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

const mapStateToProps = (state, props) => ({
  statePayrollUuid: props?.match?.params.payroll_uuid,
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.payroll.submittingMutation,
});

export default connect(mapStateToProps, mapDispatchToProps)(EnrollmentPage);
