// const appToken = process.env.APPTOKEN;
// const userName = process.env.USERNAME;
// const password = process.env.PASSWORD;
// const applicationName = process.env.APPLICATION_NAME;
const appToken = 'SdEUeIpSkqVRgnnhll+m+dNnEEBWssJwkeREnBHQSJhd8YfPta6Qb3XeoVq0fk4F';
const userName = 'abirch@adventurelinks.net';
const password = 'Shogun02';
const applicationName = 'AdventureLinksNorthernVirginia';

const SOURCE_DIR = 'SOURCE';
const OUTPUT_DIR = 'OUTPUT';

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
  baseRequest,
};
