const { sendEmail } = require('./util');
// const SignIn = require('./reports/SignIn');
const CampPhotos = require('./reports/CampPhotos');


exports.handler = (req, context, callback) => {
  const { queryStringParameters = {} } = req;
  const { startDate, endDate } = queryStringParameters;
  console.log(req);
  console.log('starting campPHotos with', startDate, endDate);
  CampPhotos(startDate, endDate)
    .through(stream => sendEmail(stream, 'Camp-Photos'))
    .stopOnError(err => console.log(err))
    .toArray((arr) => {
      console.log('done', JSON.parse(arr));
      callback(null, arr);
    });
};
