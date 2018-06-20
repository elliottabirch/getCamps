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

const formatSignInData = (data) => {
  const {

  } = data;
  return {
    firstName: 'First Name',
    lastName: 'Last Name',
    nameString: 'Names',
    numberString: 'Numbers',
    sunIn: 'Sun - In',
    sunOut: 'Sun - Out',
    monIn: 'Mon - In',
    monOut: 'Mon - Out',
    tuesIn: 'Tues - In',
    tuesOut: 'Tues - Out',
    wedIn: 'Wed - In',
    wedOut: 'Wed - Out',
    thursIn: 'Thurs - In',
    thursOut: 'Thurs - Out',
    friIn: 'Fri - In',
    friOut: 'Fri - Out',
    satIn: 'Sat - In',
    satOut: 'Sat - Out',
    canAdministerMedicine: 'Allowed To Administer Medicine',
    shirtSize: 'Shirt Size',
    unApproved: 'Unapproved',
  };
};

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
  .collect()
  .doto((a) => {
    console.log(a);
  })

  .flatMap(sessions => streamPeople({ answerIds: _.map(sessions, 'registrationDetail.personId') })
    .collect()
    .flatMap((persons) => {
      const personsBypersonId = _.keyBy(persons, 'personId');
      return hl(sessions)
        .map(session => Object.assign({
          person: personsBypersonId[session.registrationDetail.personId] || {},
        }, session));
    }))
  .collect()
  .flatMap(sessions => streamAnswers({ personIds: _.map(sessions, 'registrationDetail.personId') })
    .collect()
    .flatMap((answers) => {
      const answersByPersonId = _.keyBy(answers, 'personId');
      return hl(sessions)
        .map(session => Object.assign({
          answers: answersByPersonId[session.registrationDetail.personId] || {},
        }, session));
    }))
  .map(formatSignInData)
  .doto((a) => {
    console.log(a);
  })
  .stopOnError(err => console.log(err))
  .done(() => console.log('done'));
