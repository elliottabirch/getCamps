const moment = require('moment');

const { endPoints: { product: { season, session, tuition, sessionOption }, registration: { info: registrationInfo }, person: { detail, answer } } } = require('../constants');
const { streamData } = require('../util');

// const streamSeasons = query => streamData(query, season);
// const streamSessions = query => streamData(query, session);
// const streamRegistrations = query => streamData(query, registrationInfo);
// const streamPeople = query => streamData(query, detail);
// const streamAnswers = query => streamData(query, answer);
// const streamTuitions = query => streamData(query, tuition);
// const streamSessionOptions = query => streamData(query, sessionOption);
// const streamSeasons = query => streamData(query, season);

const streamSeasons = query => streamData(query, 'seasons');
const streamSessions = query => streamData(query, 'sessions');
const streamRegistrations = query => streamData(query, 'registrations');
const streamPeople = query => streamData(query, 'people');
const streamAnswers = query => streamData(query, 'answers');
const streamTuitions = query => streamData(query, 'tuitions');
const streamSessionOptions = query => streamData(query, 'sessionOptions');
const streamFamilies = query => streamData(query, 'family');
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

module.exports = {
  streamSeasons,
  streamSessions,
  streamSessionsInDateRange,
  streamRegistrations,
  streamPeople,
  streamAnswers,
  streamTuitions,
  streamSessionOptions,
  streamFamilies,
};

