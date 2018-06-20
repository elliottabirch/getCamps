const XLSX = require('xlsx');
const _ = require('lodash');
const hl = require('highland');

const {
  streamSessions,
  streamRegistrations,
  streamPeople,
  streamAnswers,
  streamTuitions,
  streamSeasons,
} = require('./data');

streamSeasons({ seasonIds: [] })
  .pluck('sessionIds')
  .flatMap(sessionIds => streamSessions({ sessionIds }))
  .collect()
  .flatMap(sessions => streamRegistrations({ sessionIds: _.map(sessions, 'sessionId') })
    .collect()
    .flatMap((registrations) => {
      const registrationsBySessionId = _.keyBy(registrations, 'sessionId');
      return hl(sessions)
        .map(session => Object.assign({
          registration: registrationsBySessionId[session.sessionId] || null,
        }, session))
        .filter(({ registration }) => !!registration);
    }))
  .flatMap(session => hl(session.registration.registrationDetails || [])
    .map(registrationDetail => Object.assign({ registrationDetail: registrationDetail || {} }, session)))
  .collect()
  .flatMap(sessions => streamTuitions({ tuitionIds: _.map(sessions, 'registrationDetail.tuitionId') })
    .collect()
    .flatMap((tuitions) => {
      const tuitionsByTuitionId = _.keyBy(tuitions, 'tuitionId');
      return hl(sessions)
        .map(session => Object.assign({
          tuition: tuitionsByTuitionId[session.registrationDetail.tuitionId] || {},
        }, session));
    }))
  .doto((a) => {
    console.log(a);
  })
  .stopOnError(err => console.log(err))
  .done(() => console.log('done'));
