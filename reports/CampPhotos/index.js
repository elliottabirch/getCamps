
const { streamSessionsInDateRange } = require('../../data');
const {
  streamCampPhotosReport,
  campPhotosReportColumns,
} = require('./report');
const csvStringify = require('csv-stringify');


module.exports = (startDate, endDate) => streamSessionsInDateRange(startDate, endDate)
  .map(({
    sessionId,
    location: { name: locationName },
  }) => streamCampPhotosReport(sessionId)
    .map(({ tuitionName, ...rest }) => Object.assign({ sessionName: `${tuitionName} - ${locationName}` }, rest)),
  )
  .mergeWithLimit(10)
  .through(csvStringify({ columns: campPhotosReportColumns, header: true }))
  .collect()
  .filter(data => data.length > 1)
  .map(data => data.join(''))
  .map(content => ({
    filename: `camp-photos-${startDate}-${endDate}.csv`,
    content,
  }));
