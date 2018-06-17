const moment = require('moment');

const { endPoints: { product: { season, session, tuition }, registration: { info: registrationInfo }, person: { detail, answer } } } = require('../constants');
const { streamData } = require('../util');

const streamSeasons = query => streamData(query, season);
const streamSessions = query => streamData(query, session);
const streamSessionsInDateRange = (_startDate, _endDate) => {
  const startDate = moment(_startDate);
  const endDate = moment(_endDate);
  return streamSeasons({ seasons: [] })
    .pluck('sessionIds')
    .flatten()
    .collect()
    .flatMap(sessionIds => streamSessions({ sessionIds }))
    .filter(({
      startDate: { day: startDay, month: startMonth, year: startYear },
      endDate: { day: endDay, month: endMonth, year: endYear },
    }) => {
      const start = moment(`${startYear}-${startMonth}-${startDay}`, 'YYYY-MM-DD');
      const end = moment(`${endYear}-${endMonth}-${endDay}`, 'YYYY-MM-DD');
      return ((moment(start).isSameOrBefore(startDate, 'day') && moment(end).isSameOrAfter(startDate, 'day')) ||
            (moment(end).isSameOrAfter(endDate, 'day') && moment(start).isSameOrBefore(endDate, 'day')) ||
            (moment(start).isSameOrAfter(startDate, 'day') && moment(end).isSameOrBefore(endDate, 'day')) ||
            (moment(start).isSameOrBefore(startDate, 'day') && moment(end).isSameOrAfter(endDate, 'day')));
    });
};
const streamRegistrations = query => streamData(query, registrationInfo);
const streamPeople = query => streamData(query, detail);
const streamAnswers = query => streamData(query, answer);
const streamTuitions = query => streamData(query, tuition);

module.exports = {
  streamSeasons,
  streamSessions,
  streamSessionsInDateRange,
  streamRegistrations,
  streamPeople,
  streamAnswers,
  streamTuitions,
};

// streamSeasons({ seasons: [] })
//   .pluck('sessionIds')
//   .flatten()
//   .collect()
//   .flatMap(sessionIds => streamSessions({ sessionIds }))
//   .pluck('sessionId')
//   .doto((a) => {
//     console.log(a);
//   })
//   .take(1)
//   .collect()
//   .flatMap(sessionIds => streamRegistrations({ sessionIds }))
//   .take(1)
//   .pluck('registrationDetails')
//   .flatten()
//   .pluck('personId')
//   .collect()
//   .flatMap(personIds => streamAnswers({ personIds }))
//   .pluck('questionAnswers')
//   .flatten()
//   .filter(({ label }) => /Person/.test(label) || /Not Authorized/.test(label))
//   .stopOnError(err => console.log(err))
//   .done((a) => {
//     console.log(a);
//   });

