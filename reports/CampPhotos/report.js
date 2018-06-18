const hl = require('highland');

const {
  streamRegistrations,
  streamPeople,
  streamTuitions,
  streamSessionOptions,
} = require('../../data');


const streamCampPhotosReport = sessionId => streamRegistrations({ sessionIds: [sessionId] })
  .filter(({ registrationDetails }) => !!registrationDetails)
  .pluck('registrationDetails')
  .flatten()
  .filter(({ cancelled }) => !cancelled)
  .map(({ personId, tuitionId, sessionOptions }) => ({ personId, tuitionId, sessionOptions }))
  .map(session => streamTuitions({ tuitionIds: [session.tuitionId] })
    .map(({ name: tuitionName }) => Object.assign({ tuitionName }, session)))
  .mergeWithLimit(10)
  .map(session => streamPeople({ personIds: [session.personId] })
    .map(({ email }) => Object.assign({ email }, session)))
  .mergeWithLimit(10)
  .map(({ sessionOptions, ...session }) => {
    if (sessionOptions) {
      return streamSessionOptions({ sessionOptionIds: sessionOptions.map(({ sessionOptionId }) => sessionOptionId) })
        .collect()
        .map((sessionOptionData) => {
          const campPhotoOptionData = sessionOptionData.filter(({ name }) => /photo/i.test(name));
          return Object.assign({ sessionOptions: campPhotoOptionData }, session);
        });
    }
    return hl([Object.assign({ sessionOptions: [] }, session)]);
  })
  .mergeWithLimit(10)
  .reduce((accum, { email, sessionOptions, tuitionName }) => {
    if (sessionOptions.length > 0) {
      accum.emailsPurchased.push(email);
      accum.price = sessionOptions[0].price;
    } else {
      accum.emailsNotPurchased.push(email);
    }
    accum.tuitionName = tuitionName;
    return accum;
  }, { emailsPurchased: [], emailsNotPurchased: [], price: 0 })
  .filter(({ emailsPurchased, emailsNotPurchased }) => emailsPurchased.length > 0 || emailsNotPurchased.length > 0)
  .map(({ emailsPurchased, emailsNotPurchased, ...rest }) => Object.assign({
    emailsPurchased: emailsPurchased.join(' '),
    emailsNotPurchased: emailsNotPurchased.join(' '),
    numberPurchased: emailsPurchased.length,
  }, rest));


const campPhotosReportColumns = {
  sessionName: 'Camp Code',
  numberPurchased: 'Number Purchased',
  emailsPurchased: 'Emails Who Purchased',
  emailsNotPurchased: 'Emails Who Did Not Purchased',
  price: 'Price Charged',
};


module.exports = {
  streamCampPhotosReport,
  campPhotosReportColumns,
};
