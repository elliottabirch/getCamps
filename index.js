const { sendEmail } = require('./util');
const SignIn = require('./reports/SignIn');
const CampPhotos = require('./reports/CampPhotos');

const { PHOTO_EMAIL_GROUP, CAMP_DOC_EMAIL_GROUP } = require('./constants.js');


exports.campPhotos = (req, context, callback) => {
  const { queryStringParameters = {} } = req;
  const { startDate, endDate } = queryStringParameters;
  console.log(req);
  console.log('starting campPHotos with', startDate, endDate);
  CampPhotos(startDate, endDate)
    .through(stream => sendEmail(stream, 'Sign-In', PHOTO_EMAIL_GROUP))
    .stopOnError(err => console.log(err))
    .toArray((arr) => {
      console.log('done', arr);
      callback(null, { body: { arr } });
    });
};

exports.signIn = (req, context, callback) => {
  const { queryStringParameters = {} } = req;
  const { startDate, endDate } = queryStringParameters;
  console.log(req);
  console.log('starting Sign In with', startDate, endDate);
  SignIn(startDate, endDate)
    .through(stream => sendEmail(stream, 'Sign-In', CAMP_DOC_EMAIL_GROUP))
    .stopOnError(err => console.log(err))
    .toArray((arr) => {
      console.log('done', arr);
      callback(null, { body: { arr } });
    });
};
