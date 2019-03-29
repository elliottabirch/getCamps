const XLSX = require('xlsx');
const _ = require('lodash');
const hl = require('highland');
require('dotenv').config();

const {
  streamSessions,
  streamRegistrations,
  streamPeople,
  streamAnswers,
  streamTuitions,
  streamSeasons,
  streamSessionsInDateRange,
  streamFamilies,
  streamSessionOptions,
} = require('./data');

streamSessionOptions({ sessionOptionIds: [] })
  .doto(hl.log)
  .stopOnError(err => console.log(err))
  .done(() => console.log('done`'));
