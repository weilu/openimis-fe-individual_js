export const INDIVIDUALS_MAIN_MENU_CONTRIBUTION_KEY = 'individuals.MainMenu';
export const CONTAINS_LOOKUP = 'Icontains';
export const DEFAULT_DEBOUNCE_TIME = 500;
export const DEFAULT_PAGE_SIZE = 10;
export const EMPTY_STRING = '';
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export const RIGHT_INDIVIDUAL_SEARCH = 159001;
export const RIGHT_INDIVIDUAL_CREATE = 159002;
export const RIGHT_INDIVIDUAL_UPDATE = 159003;
export const RIGHT_INDIVIDUAL_DELETE = 159004;

export const RIGHT_GROUP_INDIVIDUAL_SEARCH = RIGHT_INDIVIDUAL_SEARCH;
export const RIGHT_GROUP_INDIVIDUAL_CREATE = RIGHT_INDIVIDUAL_CREATE;
export const RIGHT_GROUP_INDIVIDUAL_UPDATE = RIGHT_INDIVIDUAL_UPDATE;
export const RIGHT_GROUP_INDIVIDUAL_DELETE = RIGHT_INDIVIDUAL_DELETE;

export const RIGHT_GROUP_SEARCH = 180001;
export const RIGHT_GROUP_CREATE = 180002;
export const RIGHT_GROUP_UPDATE = 180003;
export const RIGHT_GROUP_DELETE = 180004;

export const RIGHT_SCHEMA_SEARCH = 171001;

export const BENEFIT_PLANS_LIST_TAB_VALUE = 'BenefitPlansListTab';
export const INDIVIDUALS_LIST_TAB_VALUE = 'IndividualsListTab';
export const INDIVIDUAL_CHANGELOG_TAB_VALUE = 'IndividualChangelogTab';
export const INDIVIDUAL_TASK_TAB_VALUE = 'IndividualTaskTab';
export const GROUP_CHANGELOG_TAB_VALUE = 'GroupChangelogTab';
export const GROUP_TASK_TAB_VALUE = 'GroupTaskTab';
export const INDIVIDUAL_TABS_LABEL_CONTRIBUTION_KEY = 'individual.TabPanel.label';
export const INDIVIDUAL_TABS_PANEL_CONTRIBUTION_KEY = 'individual.TabPanel.panel';

export const BENEFIT_PLAN_TABS_LABEL_CONTRIBUTION_KEY = 'individual.BenefitPlansListTabLabel';
export const BENEFIT_PLAN_TABS_PANEL_CONTRIBUTION_KEY = 'individual.BenefitPlansListTabPanel';
export const TASK_CONTRIBUTION_KEY = 'tasksManagement.tasks';

export const BENEFICIARY_STATUS = {
  POTENTIAL: 'POTENTIAL',
  ACTIVE: 'ACTIVE',
  GRADUATED: 'GRADUATED',
  SUSPENDED: 'SUSPENDED',
};

export const GROUP_INDIVIDUAL_ROLES = {
  HEAD: 'HEAD',
  RECIPIENT: 'RECIPIENT',
};

export const GROUP_INDIVIDUAL_ROLES_LIST = [
  GROUP_INDIVIDUAL_ROLES.HEAD, GROUP_INDIVIDUAL_ROLES.RECIPIENT,
];

export const BENEFIT_PLAN_LABEL = 'BenefitPlan';
export const INDIVIDUAL_LABEL = 'Individual';
export const GROUP_LABEL = 'Group';

export const SOCIAL_PROTECTION_MODULE_NAME = 'social_protection';

export const FETCH_BENEFIT_PLAN_SCHEMA_FIELDS_REF = 'socialProtection.fetchBenefitPlanSchemaFields';
