const moment = require('moment');

const { streamSessionsInDateRange } = require('./data');


exports.handler = ({ queryParams = {} }, context, callback) => {
  const { startDate = moment().format('YYYY-MM-DD'), endDate = moment().format('YYYY-MM-DD') } = queryParams;
  streamSessionsInDateRange(startDate, endDate)
    .doto(a => console.log(a))
    .stopOnError(err => console.log(err))
    .toArray(arr => callback(null, arr));
};
