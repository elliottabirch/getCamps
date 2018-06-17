const {
  streamSessions,
  streamRegistrations,
  streamPeople,
  streamAnswers,
  streamTuitions,
} = require('../data');


const streamSignInReport = sessionId => streamSessions({ sessionIds: [sessionId] })
  .flatMap(session => streamRegistrations({ sessionIds: [sessionId] })
    .filter(({ registrationDetails }) => !!registrationDetails)
    .pluck('registrationDetails')
    .flatten()
    .filter(({ cancelled }) => !cancelled)
    .map(({ personId, tuitionId }) => Object.assign({ personId, tuitionId }, session)))
  .map(session => streamTuitions({ tuitionIds: [session.tuitionId] })
    .map(({ name: tuitionName }) => Object.assign({ tuitionName }, session)))
  .mergeWithLimit(10)
  .map(session => streamPeople({ personIds: [session.personId] })
    .map(({ firstName, lastName }) => Object.assign({ firstName, lastName }, session)))
  .mergeWithLimit(10)
  .map(session => streamAnswers({ personIds: [session.personId] })
    .pluck('questionAnswers')
    .flatten()
    .filter(({ label }) => /Person/.test(label) || /Not Authorized/.test(label) || /Shirt Size/.test(label) || /over-the-counter/i.test(label))
    .reduce((accum, { label, answer }) => {
      accum.canAdministerMedicine = accum.canAdministerMedicine || (/over-the-counter/i.test(label) && answer);
      accum.unApproved = accum.unApproved || (/Not Authorized/i.test(label) && answer);
      accum.shirtSize = accum.shirtSize || (/Shirt Size/.test(label) && answer);
      if (/Person/.test(label)) {
        accum.approved[label[8]] = accum.approved[label[8]] || {};
        if (/Phone Number/.test(label)) { accum.approved[label[8]].phoneNumber = answer; }
        if (/Full Name/.test(label)) { accum.approved[label[8]].fullName = answer; }
      }
      return accum;
    }, { canAdministerMedicine: '', unApproved: '', approved: {}, shirtSize: '' })
    .map(({ approved, ...rest }) => {
      const names = [];
      const numbers = [];
      Object.values(approved)
        .forEach(({ phoneNumber, fullName }) => {
          names.push(fullName);
          numbers.push(phoneNumber);
        });
      const nameString = names.join('~');
      const numberString = numbers.join('~');
      return Object.assign(rest, { nameString, numberString });
    })
    .map(data => Object.assign({}, data, session)))
  .mergeWithLimit(10);


const signInReportColumns = {
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


module.exports = {
  streamSignInReport,
  signInReportColumns,
};
