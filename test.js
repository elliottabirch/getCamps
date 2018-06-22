const XLSX = require('xlsx');
const _ = require('lodash');
const hl = require('highland');
require('dotenv').config();

const {
  streamSessions,
  streamRegistrations,
  streamPeople,
  streamAnswers,
  streamTuitions,
  streamSeasons,
  streamSessionsInDateRange,
  streamFamilies,
} = require('./data');

const signInHeaders = {
  campCode: 'Camp Code',
  campName: 'Camp Name',
  startDate: 'Start Date',
  endDate: 'End Date',
  firstName: 'First Name',
  lastName: 'Last Name',
  primaryName: 'Primary Parent Name',
  primaryNumber: 'Primary Parent Number',
  secondaryName: 'secondary Parent Name',
  secondaryNumber: 'secondary Parent Number',
  p1Name: 'p1 Name',
  p1Number: 'p1 Number',
  p1Relation: 'p1 Relation',
  p2Name: 'p2 Name',
  p2Number: 'p2 Number',
  p2Relation: 'p2 Relation',
  p3Name: 'p3 Name',
  p3Number: 'p3 Number',
  p3Relation: 'p3 Relation',
  forbiddenMedication: 'Forbidden OTC Meds',
  canAdministerMedicine: 'Allowed To Administer Medicine',
  shirtSize: 'Shirt Size',
  unApproved: 'Unapproved',
};

const formatParentData = ({ person }) => {
  const {
    firstName: primaryFirst,
    lastName: primaryLast,
    homePhoneNumber,
    businessPhoneNumber,
    cellPhoneNumber,
  } = person || {};
  const { phoneNumber: phomePN } = homePhoneNumber || {};
  const { phoneNumber: pbizPN } = businessPhoneNumber || {};
  const { phoneNumber: pcellPN } = cellPhoneNumber || {};
  const numbers = [phomePN, pbizPN, pcellPN].filter(val => !!val);
  return { name: `${primaryFirst || ''} ${primaryLast || ''}`, number: numbers.join('/') };
};

const formatAnswers = answers => answers.reduce((accum, { label, answer }) => {
  accum.canAdministerMedicine = accum.canAdministerMedicine || (/over-the-counter/i.test(label) && answer);
  accum.unApproved = accum.unApproved || (/Not Authorized/i.test(label) && answer);
  accum.shirtSize = accum.shirtSize || (/Shirt Size/.test(label) && answer);
  accum.forbiddenMedication = accum.forbiddenMedication || (/Over-the-Counter/.test(label) && answer);
  if (/Person/.test(label)) {
    const number = label[8];
    if (/Phone Number/.test(label)) accum[`p${number}Number`] = answer;
    if (/Full Name/.test(label)) { accum[`p${number}Name`] = answer; }
    if (/Relation/.test(label)) { accum[`p${number}Relation`] = answer; }
  }
  return accum;
}, { forbiddenMedication: '', canAdministerMedicine: '', unApproved: '', shirtSize: '' });

const formatSignInData = (data) => {
  const {
    sessionId,
    person = {},
    answers = {},
    tuition: { name: tuitionName },
    location: { name: locationName },
    name: sessionName,
    startDate: { day: startDay, month: startMonth, year: startYear },
    endDate: { day: endDay, month: endMonth, year: endYear },
    family = [],
  } = data;
  const { firstName, lastName } = person;
  const [primaryParent = {}] = family.filter(({ isPrimaryParent }) => isPrimaryParent === 'Yes');
  const { name: primaryName, number: primaryNumber } = formatParentData(primaryParent);
  const [secondaryParent = {}] = family.filter(({ isSecondaryParent }) => isSecondaryParent === 'Yes');
  const { name: secondaryName, number: secondaryNumber } = formatParentData(secondaryParent);
  const { questionAnswers } = answers;
  const {
    p1Name,
    p1Number,
    p1Relation,
    p2Name,
    p2Number,
    p2Relation,
    p3Name,
    p3Number,
    p3Relation,
    canAdministerMedicine,
    shirtSize,
    unApproved,
    forbiddenMedication,
  } = formatAnswers(questionAnswers);
  return {
    sessionId,
    campCode: `${tuitionName}`,
    campName: `${sessionName} - ${locationName}`,
    startDate: `${startMonth}/${startDay}/${startYear}`,
    endDate: `${endMonth}/${endDay}/${endYear}`,
    firstName,
    lastName,
    primaryName,
    primaryNumber,
    secondaryName,
    secondaryNumber,
    p1Name,
    p1Number,
    p1Relation,
    p2Name,
    p2Number,
    p2Relation,
    p3Name,
    p3Number,
    p3Relation,
    canAdministerMedicine,
    forbiddenMedication,
    shirtSize,
    unApproved,
  };
};

const assignDocumentData = (documents, getter, localKey, foreignKey, as) => getter({ [`${foreignKey}s`]: _.map(documents, localKey) })
  .collect()
  .flatMap((docsToAdd) => {
    const docsToAddByForeignKey = _.keyBy(docsToAdd, foreignKey);
    return hl(documents)
      .map(document => Object.assign({
        [`${as}`]: docsToAddByForeignKey[document[localKey]] || {},
      }, document));
  });
let currentBook = 0;

const endDate = new Date('2018-06-20T00:00:00-07:00');
const startDate = new Date('2018-06-10T00:00:00-07:00');

streamSessionsInDateRange(startDate, endDate)
  .collect()
  .flatMap(sessions => assignDocumentData(sessions, streamRegistrations, 'sessionId', 'sessionId', 'registration'))
  .flatMap(session => hl(session.registration.registrationDetails || [])
    .map(({ tuitionId, personId }) => Object.assign({ tuitionId, personId }, session)))
  .collect()
  .flatMap(sessions => assignDocumentData(sessions, streamTuitions, 'tuitionId', 'tuitionId', 'tuition'))
  .collect()
  .flatMap(sessions => assignDocumentData(sessions, streamPeople, 'personId', 'personId', 'person'))
  .collect()
  .flatMap(sessions => streamFamilies({ personIds: _.map(sessions, 'personId') })
    .collect()
    .flatMap(families => assignDocumentData(families, streamPeople, 'personId', 'personId', 'person'))
    .collect()
    .flatMap((families) => {
      const familiesByFamilyId = _.groupBy(families, 'familyId');
      return hl(sessions)
        .map(session => Object.assign({ family: familiesByFamilyId[session.person.familyId] }, session));
    }))
  .collect()
  .flatMap(families => assignDocumentData(families, streamAnswers, 'personId', 'personId', 'answers'))
  .map(formatSignInData)
  .collect()
  .map(sessions => _.groupBy(sessions, 'sessionId'))
  .map(hl.values)
  .merge()
  .map(rows => rows.map(({ sessionId, ...rest }) => rest))
  .map(rows => [signInHeaders, ...rows])
  .batch(10)
  .map((sheets) => {
    let currentSheet = 0;
    return hl(sheets)
      .doto(() => currentSheet++)
      .reduce((wb, sheet) => {
        const ws = XLSX.utils.json_to_sheet(sheet, { header: Object.keys(signInHeaders), skipHeader: true });
        XLSX.utils.book_append_sheet(wb, ws, `sheet${currentSheet}`);
        return wb;
      }, XLSX.utils.book_new())
      .doto(() => currentBook++)
      .map(wb => XLSX.writeFile(wb, `book${currentBook}.xlsx`));
  })
  .merge()
  .stopOnError((err) => {
    console.log(err);
  })
  .done(() => {
    console.log('done');
  });

