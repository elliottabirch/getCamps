const appToken = process.env.APPTOKEN;
const userName = process.env.USERNAME;
const password = process.env.PASSWORD;
const applicationName = process.env.APPLICATION_NAME;
const mailerEmail = process.env.MAILER_EMAIL;
const mailerPass = process.env.MAILER_PASS;

const SOURCE_DIR = 'SOURCE';
const OUTPUT_DIR = 'OUTPUT';

const PHOTO_EMAIL_GROUP = ['photos@adventurelinks.net'];
const CAMP_DOC_EMAIL_GROUP = ['camp@adventurelinks.net'];
const DEV_EMAIL_GROUP = ['elliottabirch@gmail.com'];

const baseBody = {
  appToken,
};

const baseRequest = {
  userName,
  password,
  applicationName,
};

const endPoints = {
  base: 'https://awapi.active.com/rest',
  product: {
    season: 'camps-season-info',
    session: 'camps-session-info',
    tuition: 'camps-tuition-info',
    sessionOption: 'camps-session-option-info',
  },
  registration: {
    info: 'camps-registration-info-v3',
  },
  payment: {
    info: '',
    allocation: '',
  },
  person: {
    basic: 'camps-person-basic-info',
    detail: 'camps-person-detail-info',
    answer: 'camps-person-answer-info',
    family: 'camps-family-info-v2',
  },
  group: {
    assignment: '',
    participant: '',
    info: '',
  },
  merchandise: {
    detail: '',
    purchase: '',
  },
};

module.exports = {
  SOURCE_DIR,
  OUTPUT_DIR,
  endPoints,
  baseBody,
  PHOTO_EMAIL_GROUP,
  CAMP_DOC_EMAIL_GROUP,
  DEV_EMAIL_GROUP,
  baseRequest,
  mailerEmail,
  mailerPass,
};
