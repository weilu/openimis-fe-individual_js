import {
  graphql,
  formatPageQuery,
  formatQuery,
  formatPageQueryWithCount,
  formatMutation,
  formatGQLString,
  graphqlWithVariables,
  prepareMutation,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';
import {
  CLEAR, ERROR, REQUEST, SET, SUCCESS,
} from './util/action-type';
import {
  ACCEPT, APPROVED, FAILED, REJECT,
} from './constants';

const WORKFLOWS_FULL_PROJECTION = () => [
  'name',
  'group',
];

const ENROLLMENT_SUMMARY_FULL_PROJECTION = () => [
  'totalNumberOfIndividuals',
  'numberOfSelectedIndividuals',
  'numberOfIndividualsAssignedToProgramme',
  'numberOfIndividualsNotAssignedToProgramme',
  'numberOfIndividualsAssignedToSelectedProgramme',
  'numberOfIndividualsToUpload',
];

const ENROLLMENT_GROUP_SUMMARY_FULL_PROJECTION = () => [
  'totalNumberOfGroups',
  'numberOfSelectedGroups',
  'numberOfGroupsAssignedToProgramme',
  'numberOfGroupsNotAssignedToProgramme',
  'numberOfGroupsAssignedToSelectedProgramme',
  'numberOfGroupsToUpload',
];

export function fetchWorkflows() {
  const payload = formatQuery(
    'workflow',
    ['group: "individual"'],
    WORKFLOWS_FULL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.GET_WORKFLOWS);
}

const INDIVIDUAL_FULL_PROJECTION = (mm) => [
  'id',
  'isDeleted',
  'dateCreated',
  'dateUpdated',
  'firstName',
  'lastName',
  'dob',
  'jsonExt',
  'version',
  'userUpdated {username}',
  `location${mm.getProjection('location.Location.FlatProjection')}`,
];

const GROUP_INDIVIDUAL_FULL_PROJECTION = [
  'id',
  'individual {id, firstName, lastName, dob}',
  'group {id, code}',
  'role',
  'recipientType',
  'isDeleted',
  'dateCreated',
  'dateUpdated',
  'jsonExt',
];

const GROUP_FULL_PROJECTION = (mm) => [
  'id',
  'code',
  'isDeleted',
  'head {firstName, lastName, uuid}',
  'dateCreated',
  'dateUpdated',
  'jsonExt',
  'version',
  'userUpdated {username}',
  `location${mm.getProjection('location.Location.FlatProjection')}`,
];

const GROUP_INDIVIDUAL_HISTORY_FULL_PROJECTION = [
  'id',
  'individual {id, firstName, lastName, dob}',
  'group {id}',
  'role',
  'recipientType',
  'isDeleted',
  'dateCreated',
  'dateUpdated',
  'jsonExt',
  'version',
];

const GROUP_HISTORY_FULL_PROJECTION = (mm) => GROUP_FULL_PROJECTION(mm).filter(
  (item) => item !== 'head {firstName, lastName}',
);

const UPLOAD_HISTORY_FULL_PROJECTION = () => [
  'id',
  'uuid',
  'workflow',
  'dataUpload {uuid, dateCreated, dateUpdated, sourceName, sourceType, status, error }',
  'userCreated {username}',
];

const API_ETL_PROJECTION = () => [
  'etlServices{nameOfService}',
];

export function fetchApiEtlServices() {
  const payload = formatQuery(
    'etlServicesByServiceName',
    [],
    API_ETL_PROJECTION(),
  );
  return graphql(
    payload,
    'API_ETL_SERVICES',
  );
}

export function fetchIndividualEnrollmentSummary(params) {
  const payload = formatQuery(
    'individualEnrollmentSummary',
    params,
    ENROLLMENT_SUMMARY_FULL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.ENROLLMENT_SUMMARY);
}

export function fetchGroupEnrollmentSummary(params) {
  const payload = formatQuery(
    'groupEnrollmentSummary',
    params,
    ENROLLMENT_GROUP_SUMMARY_FULL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.ENROLLMENT_GROUP_SUMMARY);
}

export function fetchIndividuals(mm, params) {
  const payload = formatPageQueryWithCount('individual', params, INDIVIDUAL_FULL_PROJECTION(mm));
  return graphql(payload, ACTION_TYPE.SEARCH_INDIVIDUALS);
}

export function fetchGroupIndividuals(params) {
  const payload = formatPageQueryWithCount('groupIndividual', params, GROUP_INDIVIDUAL_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS);
}

export function fetchGroups(mm, params) {
  const payload = formatPageQueryWithCount('group', params, GROUP_FULL_PROJECTION(mm));
  return graphql(payload, ACTION_TYPE.SEARCH_GROUPS);
}

export function fetchIndividual(mm, params) {
  const payload = formatPageQuery('individual', params, INDIVIDUAL_FULL_PROJECTION(mm));
  return graphql(payload, ACTION_TYPE.GET_INDIVIDUAL);
}

export function fetchIndividualHistory(mm, params) {
  const payload = formatPageQueryWithCount('individualHistory', params, INDIVIDUAL_FULL_PROJECTION(mm));
  return graphql(payload, ACTION_TYPE.SEARCH_INDIVIDUAL_HISTORY);
}

export function fetchGroup(mm, params) {
  const payload = formatPageQuery('group', params, GROUP_FULL_PROJECTION(mm));
  return graphql(payload, ACTION_TYPE.GET_GROUP);
}

export function fetchGroupHistory(mm, params) {
  const payload = formatPageQueryWithCount('groupHistory', params, GROUP_HISTORY_FULL_PROJECTION(mm));
  return graphql(payload, ACTION_TYPE.SEARCH_GROUP_HISTORY);
}

export function fetchGroupIndividualHistory(params) {
  const payload = formatPageQueryWithCount('groupIndividualHistory', params, GROUP_INDIVIDUAL_HISTORY_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_GROUP_INDIVIDUAL_HISTORY);
}

export function fetchUploadHistory(params) {
  const payload = formatPageQueryWithCount('individualDataUploadHistory', params, UPLOAD_HISTORY_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_INDIVIDUAL_UPLOAD_HISTORY);
}

export function deleteIndividual(individual, clientMutationLabel) {
  const individualUuids = `ids: ["${individual?.id}"]`;
  const mutation = formatMutation('deleteIndividual', individualUuids, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.DELETE_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function undoDeleteIndividual(individual, clientMutationLabel) {
  const individualUuids = `ids: ["${individual?.id}"]`;
  const mutation = formatMutation('undoDeleteIndividual', individualUuids, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UNDO_DELETE_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UNDO_DELETE_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function deleteGroupIndividual(groupIndividual, clientMutationLabel) {
  const groupIndividualUuids = `ids: ["${groupIndividual?.id}"]`;
  const mutation = formatMutation('removeIndividualFromGroup', groupIndividualUuids, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_GROUP_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.DELETE_GROUP_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function deleteGroup(group, clientMutationLabel) {
  const groupUuids = `ids: ["${group?.id}"]`;
  const mutation = formatMutation('deleteGroup', groupUuids, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_GROUP), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.DELETE_GROUP,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

function dateTimeToDate(date) {
  return date.split('T')[0];
}

function formatGroupGQL(group, groupIndividualId = null) {
  return `
    ${group?.id ? `id: "${group.id}"` : ''}
    ${groupIndividualId ? `groupIndividualId: "${groupIndividualId}"` : ''}`;
}

function formatCreateGroupGQL(group) {
  return `
    ${group?.code ? `code: "${group.code}"` : ''}
    ${'individualsData: []'}
  `;
}

function formatIndividualGQL(individual) {
  return `
    ${individual?.id ? `id: "${individual.id}"` : ''}
    ${individual?.firstName ? `firstName: "${formatGQLString(individual.firstName)}"` : ''}
    ${individual?.lastName ? `lastName: "${formatGQLString(individual.lastName)}"` : ''}
    ${individual?.jsonExt ? `jsonExt: ${JSON.stringify(individual.jsonExt)}` : ''}
    ${individual?.dob ? `dob: "${dateTimeToDate(individual.dob)}"` : ''}`;
}

function formatGroupIndividualGQL(groupIndividual) {
  return `
    ${groupIndividual?.id ? `id: "${groupIndividual.id}"` : ''}
    ${groupIndividual?.role ? `role: ${groupIndividual.role}` : ''}
    ${groupIndividual?.recipientType ? `recipientType: ${groupIndividual.recipientType}` : ''}
    ${groupIndividual?.individual.id ? `individualId: "${groupIndividual.individual.id}"` : ''}
    ${groupIndividual?.group.id ? `groupId: "${groupIndividual.group.id}"` : ''}`;
}

function formatCreateGroupIndividualGQL(groupIndividual) {
  return `
    ${groupIndividual?.id ? `id: "${groupIndividual.id}"` : ''}
    ${groupIndividual?.role ? `role: ${groupIndividual.role}` : ''}
    ${groupIndividual?.recipientType ? `recipientType: ${groupIndividual.recipientType}` : ''}
    ${groupIndividual?.individual.id ? `individualId: "${groupIndividual.individual.id}"` : ''}
    ${groupIndividual?.group.id ? `groupId: "${groupIndividual.group.id}"` : ''}`;
}

function formatConfirmEnrollmentGQL(params) {
  return `
    ${params?.customFilters ? `customFilters: ${params.customFilters}` : ''}
    ${params?.benefitPlanId ? `benefitPlanId: ${params.benefitPlanId}` : ''}
    ${params?.status ? `status: ${params.status}` : ''}`;
}

export function updateIndividual(individual, clientMutationLabel) {
  const mutation = formatMutation('updateIndividual', formatIndividualGQL(individual), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function confirmEnrollment(params, clientMutationLabel) {
  // eslint-disable-next-line max-len
  const mutation = formatMutation('confirmIndividualEnrollment', formatConfirmEnrollmentGQL(params), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CONFIRM_ENROLLMENT), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function confirmGroupEnrollment(params, clientMutationLabel) {
  // eslint-disable-next-line max-len
  const mutation = formatMutation('confirmGroupEnrollment', formatConfirmEnrollmentGQL(params), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CONFIRM_GROUP_ENROLLMENT), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_GROUP,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateGroupIndividual(groupIndividual, clientMutationLabel) {
  const mutation = formatMutation(
    'editIndividualInGroup',
    formatGroupIndividualGQL(groupIndividual),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_GROUP_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_GROUP_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function creteGroupIndividual(groupIndividual, clientMutationLabel) {
  const mutation = formatMutation(
    'addIndividualToGroup',
    formatCreateGroupIndividualGQL(groupIndividual),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CREATE_GROUP_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.CREATE_GROUP_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function createGroupAndMoveIndividual(group, individualIds, clientMutationLabel) {
  const mutation = formatMutation(
    'createGroupAndMoveIndividual',
    formatGroupGQL(group, individualIds),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CREATE_GROUP_AND_MOVE_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.CREATE_GROUP_AND_MOVE_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateGroup(group, clientMutationLabel) {
  const mutation = formatMutation('updateGroup', formatGroupGQL(group), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_GROUP), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_GROUP,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function createGroup(group, clientMutationLabel) {
  const mutation = formatMutation('createGroup', formatCreateGroupGQL(group), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CREATE_GROUP), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.CREATE_GROUP,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function fetchPendingGroupUploads(variables) {
  return graphqlWithVariables(
    `
      query (
        $upload_Id: ID, $group_Id_Isnull: Boolean
        ${variables.after ? ',$after: String' : ''} 
        ${variables.before ? ',$before: String' : ''}
        ${variables.pageSize ? ',$pageSize: Int' : ''}
        ${variables.isDeleted !== undefined ? ',$isDeleted: Boolean' : ''}
      ) {
        groupDataSource(
          upload_Id: $upload_Id, group_Id_Isnull:$group_Id_Isnull, 
          ${variables.isDeleted !== undefined ? ',isDeleted: $isDeleted' : ''}
          ${variables.before ? ',before:$before, last:$pageSize' : ''}
          ${!variables.before ? ',first:$pageSize' : ''}
          ${variables.after ? ',after:$after' : ''}
        )
        {
          totalCount
          pageInfo { hasNextPage, hasPreviousPage, startCursor, endCursor}
          edges
          {
            node
            {
              id, uuid, jsonExt, group { code }
              
            }
          }
        }
      }
    `,
    variables,
    ACTION_TYPE.GET_PENDING_GROUPS_UPLOAD,
  );
}

export const formatTaskResolveGQL = (task, user, approveOrFail, additionalData) => `
  ${task?.id ? `id: "${task.id}"` : ''}
  ${user && approveOrFail ? `businessStatus: "{\\"${user.id}\\": \\"${approveOrFail}\\"}"` : ''}
  ${additionalData ? `additionalData: "${additionalData}"` : ''}
  `;

export function resolveTask(task, clientMutationLabel, user, approveOrFail, additionalData = null) {
  const mutationType = 'resolveTask';
  const mutationInput = formatTaskResolveGQL(task, user, approveOrFail, additionalData);
  const mutation = formatMutation(mutationType, mutationInput, clientMutationLabel);
  const requestedDateTime = new Date();

  const userId = user?.id;

  const mutation2 = prepareMutation(
    `mutation ($clientMutationLabel:String, $clientMutationId: String, $id:UUID!, 
      $businessStatus: JSONString!, ${additionalData ? '$additionalData: JSONString!' : ''}
    ) {
      resolveTask(
      input: {
        clientMutationId: $clientMutationId
        clientMutationLabel: $clientMutationLabel
  
        id: $id
        businessStatus: $businessStatus
        ${additionalData ? 'additionalData: $additionalData' : ''}
              }
            ) {
              clientMutationId
              internalId
            }
          }`,
    {
      id: task?.id,
      businessStatus: (() => {
        if (!userId) return undefined;

        switch (approveOrFail) {
          case APPROVED:
          case FAILED:
            return JSON.stringify({ [userId]: approveOrFail });
          case ACCEPT:
          case REJECT:
            return JSON.stringify({ [userId]: { [approveOrFail]: additionalData } });
          default:
            throw new Error('Invalid approveOrFail value');
        }
      })(),
      // eslint-disable-next-line max-len
      additionalData: additionalData ? JSON.stringify({ entries: additionalData, decision: additionalData }) : undefined,
    },
    {
      id: task?.id,
      businessStatus: (() => {
        if (!userId) return undefined;

        switch (approveOrFail) {
          case APPROVED:
          case FAILED:
            return JSON.stringify({ [userId]: approveOrFail });
          case ACCEPT:
          case REJECT:
            return JSON.stringify({ [userId]: { [approveOrFail]: additionalData } });
          default:
            throw new Error('Invalid approveOrFail value');
        }
      })(),
      // eslint-disable-next-line max-len
      additionalData: additionalData ? JSON.stringify({ entries: additionalData, decision: additionalData }) : undefined,
    },
  );

  // eslint-disable-next-line no-param-reassign
  user.clientMutationId = mutation.clientMutationId;

  return graphqlWithVariables(
    mutation2.operation,
    {
      ...mutation2.variables.input,
    },
    ['TASK_MANAGEMENT_MUTATION_REQ', 'TASK_MANAGEMENT_MUTATION_RESP', 'TASK_MANAGEMENT_MUTATION_ERR'],
    {
      requestedDateTime, clientMutationId: mutation.clientMutationId, clientMutationLabel, userId: user.id,
    },
  );
}

export function confirmPullingDataFromApiEtl(nameOfService, clientMutationLabel) {
  // eslint-disable-next-line max-len
  const mutationInput = `nameOfService: "${nameOfService}"`;
  const mutation = formatMutation('etlServiceMutation', mutationInput, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.PULL_API_DATA), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.PULL_API_DATA,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function fetchMutationByLabel(clientMutationLabel) {
  const MUTATION_RECEIVED_STATUS = 0;
  const payload = formatPageQuery(
    'mutationLogs',
    [`clientMutationLabel: "${clientMutationLabel}", status: ${MUTATION_RECEIVED_STATUS}`],
    [
      'id',
      'status',
      'error',
      'clientMutationId',
      'clientMutationLabel',
      'clientMutationDetails',
      'requestDateTime',
      'jsonExt',
      'autogeneratedCode',
    ],
  );
  return graphql(payload, ACTION_TYPE.FETCH_ACTIVE_MUTATIONS);
}

export function downloadGroups(params) {
  const payload = `
    {
      groupExport${!!params && params.length ? `(${params.join(',')})` : ''}
    }`;
  return graphql(payload, ACTION_TYPE.GROUP_EXPORT);
}

export function downloadIndividuals(params) {
  const payload = `
    {
      individualExport${!!params && params.length ? `(${params.join(',')})` : ''}
    }`;
  return graphql(payload, ACTION_TYPE.INDIVIDUAL_EXPORT);
}

export function downloadGroupIndividuals(params) {
  const payload = `
    {
      groupIndividualExport${!!params && params.length ? `(${params.join(',')})` : ''}
    }`;
  return graphql(payload, ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT);
}

export const setNewGroupIndividual = (groupIndividual) => (dispatch) => {
  dispatch({
    type: SET(ACTION_TYPE.SET_GROUP_INDIVIDUAL), payload: groupIndividual,
  });
};

export const clearGroupIndividualExport = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT),
  });
};

export const clearIndividualExport = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.INDIVIDUAL_EXPORT),
  });
};

export const clearGroupExport = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.GROUP_EXPORT),
  });
};

export const clearGroup = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.GET_GROUP),
  });
};

export const clearGroupIndividuals = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS),
  });
};
