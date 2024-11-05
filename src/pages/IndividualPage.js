import React, { useState, useRef, useEffect } from 'react';
import {
  Form,
  Helmet,
  withHistory,
  formatMessage,
  formatMessageWithValues,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import { withTheme, withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import UndoIcon from '@material-ui/icons/Undo';
import { RIGHT_INDIVIDUAL_UPDATE } from '../constants';
import {
  fetchIndividual, deleteIndividual, updateIndividual, undoDeleteIndividual,
} from '../actions';
import IndividualHeadPanel from '../components/IndividualHeadPanel';
import IndividualTabPanel from '../components/IndividualTabPanel';
import { ACTION_TYPE } from '../reducer';

const styles = (theme) => ({
  page: theme.page,
});

function IndividualPage({
  intl,
  modulesManager,
  classes,
  rights,
  history,
  individualUuid,
  individual,
  fetchIndividual,
  deleteIndividual,
  updateIndividual,
  coreConfirm,
  clearConfirm,
  confirmed,
  submittingMutation,
  mutation,
  journalize,
  undoDeleteIndividual,
}) {
  const [editedIndividual, setEditedIndividual] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    if (individualUuid) {
      fetchIndividual(modulesManager, [`id: "${individualUuid}"`]);
    }
  }, [individualUuid]);

  useEffect(() => {
    if (confirmed && confirmedAction) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  const back = () => history.goBack();

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.DELETE_INDIVIDUAL) {
        back();
      }
      if (mutation?.actionType === ACTION_TYPE.UNDO_DELETE_INDIVIDUAL) {
        window.location.reload();
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => setEditedIndividual(individual), [individual]);

  const titleParams = (individual) => ({
    firstName: individual?.firstName,
    lastName: individual?.lastName,
  });

  const isMandatoryFieldsEmpty = () => {
    if (editedIndividual === undefined || editedIndividual === null) {
      return false;
    }
    if (
      !!editedIndividual.firstName
      && !!editedIndividual.lastName
      && !!editedIndividual.dob
    ) {
      return false;
    }
    return true;
  };

  const doesIndividualChange = () => {
    if (_.isEqual(individual, editedIndividual)) {
      return false;
    }
    return true;
  };

  const canSave = () => !isMandatoryFieldsEmpty() && doesIndividualChange();

  const handleSave = () => {
    updateIndividual(
      editedIndividual,
      formatMessageWithValues(intl, 'individual', 'individual.update.mutationLabel', {
        id: individual?.id,
      }),
    );
  };

  const deleteIndividualCallback = () => deleteIndividual(
    individual,
    formatMessageWithValues(intl, 'individual', 'individual.delete.mutationLabel', {
      id: individual?.id,
    }),
  );

  const undoDeleteIndividualCallback = () => undoDeleteIndividual(
    individual,
    formatMessageWithValues(intl, 'individual', 'individual.undo.mutationLabel', {
      id: individual?.id,
    }),
  );

  const openDeleteIndividualConfirmDialog = () => {
    setConfirmedAction(() => deleteIndividualCallback);
    coreConfirm(
      formatMessageWithValues(intl, 'individual', 'individual.delete.confirm.title', {
        firstName: individual?.firstName,
        lastName: individual?.lastName,
      }),
      formatMessage(intl, 'individual', 'individual.delete.confirm.message'),
    );
  };

  const openUndoIndividualConfirmDialog = () => {
    setConfirmedAction(() => undoDeleteIndividualCallback);
    coreConfirm(
      formatMessageWithValues(intl, 'individual', 'individual.undo.confirm.title', {
        firstName: individual?.firstName,
        lastName: individual?.lastName,
      }),
      formatMessage(intl, 'individual', 'individual.undo.confirm.message'),
    );
  };

  const actions = [
    {
      doIt: openDeleteIndividualConfirmDialog,
      icon: <DeleteIcon />,
      tooltip: formatMessage(intl, 'individual', 'deleteButtonTooltip'),
      disabled: individual?.isDeleted,
    },
    {
      doIt: openUndoIndividualConfirmDialog,
      icon: <UndoIcon />,
      tooltip: formatMessage(intl, 'individual', 'undoButtonTooltip'),
      disabled: !individual?.isDeleted,
    },
  ];

  return (
    rights.includes(RIGHT_INDIVIDUAL_UPDATE) && (
      <div className={classes.page}>
        <Helmet title={formatMessageWithValues(intl, 'individual', 'pageTitle', titleParams(individual))} />
        <Form
          module="individual"
          title="pageTitle"
          titleParams={titleParams(individual)}
          openDirty
          individual={editedIndividual}
          edited={editedIndividual}
          onEditedChanged={setEditedIndividual}
          back={back}
          mandatoryFieldsEmpty={isMandatoryFieldsEmpty}
          canSave={canSave}
          save={handleSave}
          HeadPanel={IndividualHeadPanel}
          Panels={[IndividualTabPanel]}
          rights={rights}
          actions={actions}
          setConfirmedAction={setConfirmedAction}
          saveTooltip={formatMessage(intl, 'individual', `saveButton.tooltip.${canSave ? 'enabled' : 'disabled'}`)}
        />
      </div>
    )
  );
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  individualUuid: props.match.params.individual_uuid,
  confirmed: state.core.confirmed,
  fetchingIndividuals: state.individual.fetchingIndividuals,
  fetchedIndividuals: state.individual.fetchedIndividuals,
  individual: state.individual.individual,
  errorIndividual: state.individual.errorIndividual,
  submittingMutation: state.individual.submittingMutation,
  mutation: state.individual.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchIndividual,
  deleteIndividual,
  updateIndividual,
  undoDeleteIndividual,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default withHistory(
  injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(IndividualPage)))),
);
