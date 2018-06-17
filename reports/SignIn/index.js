const hl = require('highland');

const { streamSessionsInDateRange } = require('../../data');
const { streamSignInReport, signInReportColumns } = require('./report');
const csvStringify = require('csv-stringify');


module.exports = (startDate, endDate) => streamSessionsInDateRange(startDate, endDate)
  .map(({
    sessionId,
    location: { name: locationName },
    startDate: { day: startDay, month: startMonth, year: startYear },
    endDate: { day: endDay, month: endMonth, year: endYear },
    name: sessionName,
  }) => streamSignInReport(sessionId)
    .collect()
    .filter(rows => rows.length > 0)
    .map((rows) => {
      const tuitionNames = rows.map(({ tuitionName }) => tuitionName);
      return hl([
        hl(tuitionNames)
          .uniq()
          .collect()
          .flatMap(uniqTuitionNames => hl([
            'Camp Codes,Session Name,Session Start Date,Session End Date\n',
            `${uniqTuitionNames.join('/')},${sessionName}-${locationName},${startMonth}/${startDay}/${startYear},${endMonth}/${endDay}/${endYear}\n`,
            '\n',
            '\n',
          ])),
        hl(rows).through(csvStringify({ columns: signInReportColumns, header: true })),
      ]).parallel(2);
    })
    .merge()
    .collect()
    .filter(data => data.length > 0)
    .map(data => data.join(''))
    .map(content => ({
      filename: `sign-in-${sessionName}-${locationName}.csv`,
      content,
    })))
  .mergeWithLimit(10);
