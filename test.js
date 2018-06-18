const { sendEmail } = require('./util');
// const SignIn = require('./reports/SignIn');
const CampPhotos = require('./reports/CampPhotos');


exports.handler = ({ queryStringParameters }, context, callback) => {
  const { startDate, endDate } = queryStringParameters;
  CampPhotos(startDate, endDate)
    .through(stream => sendEmail(stream, 'Camp-Photos'))
    .stopOnError(err => console.log(err))
    .toArray(arr => callback(null, arr));
};


exports.handler({
  queryStringParameters: {
    startDate: '2018-06-10',
    endDate: '2018-06-20',
  },
}, {}, (err, data) => console.log(err, data));
