const { sendEmail } = require('./util');
const SignIn = require('./reports/SignIn');


exports.handler = ({ queryStringParameters }, context, callback) => {
  const { startDate, endDate } = queryStringParameters;
  SignIn(startDate, endDate)
    .through(sendEmail)
    .stopOnError(err => console.log(err))
    .toArray(arr => callback(null, arr));
};
