
const {
  streamSessions,
  streamRegistrations,
  streamPeople,
  streamAnswers,
} = require('../data');


const streamSignInReport = sessionId => streamSessions({ sessionIds: [sessionId] })
  .map(({
    name: sessionName,
    startDate: { day: startDay, month: startMonth, year: startYear },
    endDate: { day: endDay, month: endMonth, year: endYear },
  }) => ({
    sessionName,
    sessionStart: `${startMonth}/${startDay}/${startYear}`,
    sessionEnd: `${endMonth}/${endDay}/${endYear}`,
  }))
  .flatMap(session => streamRegistrations({ sessionIds: [sessionId] })
    .pluck('registrationDetails')
    .flatten()
    .map(({ personId }) => Object.assign({ personId }, session)))
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
    .map((data) => {
      const approved = Object.values(data.approved)
        .map(({ phoneNumber, fullName }) => `${fullName} - ${phoneNumber}`)
        .join('/');
      return Object.assign(data, { approved });
    })
    .map(data => Object.assign({}, data, session)))
  .mergeWithLimit(10);


const signInReportColumns = {
  sessionName: 'Session Name',
  sessionStart: 'Start Date',
  sessionEnd: 'End Date',
  firstName: 'First Name',
  lastName: 'Last Name',
  approved: 'Approved',
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
