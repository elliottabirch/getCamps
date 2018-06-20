const XLSX = require('xlsx');

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
  .flatMap((sessionIds) => streamSessions({ sessionIds }))
  .doto((a) => {
    console.log(a);
  })
  .stopOnError(err => console.log(err))
  .done(() => console.log('done'));
