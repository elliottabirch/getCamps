const csvStringify = require('csv-stringify');
const hl = require('highland');
const request = require('request-promise');
const nodemailer = require('nodemailer');


const { endPoints: { base }, baseRequest, baseBody } = require('./constants');

const generateCsv = (stream, columns) => stream
  .through(csvStringify({ columns, header: true }));


const createUrl = (url, endPoint) => `${url}/${endPoint}`;

const parseBuffer = stream => stream
  .collect()
  .map(buffers => buffers.join(''))
  .map(res => JSON.parse(res));

const streamData = (query, endPoint) => {
  const body = Object.assign({ request: Object.assign(query, baseRequest) }, baseBody);
  return hl(request.post({
    uri: createUrl(base, endPoint),
    body,
    json: true,
  }))
    .through(parseBuffer)
    .flatten();
};

const sendEmail = (stream, subject) => stream
  .collect()
  .flatMap((attachments) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'eng@adventurelinks.net',
        pass: 'eng13220',
      },
    });

    const mailOptions = {
      from: 'eng@adventurelinks.net',
      to: [
        'eng@adventurelinks.net',
        'developer@adventurelinks.net',
        'elliottabirch@gmail.com',
      ],
      subject: `${subject}-${new Date()}`,
      attachments,
    };
    return hl((push) => {
      transporter.sendMail(mailOptions,
        (error, info) => {
          push(error, info);
          push(null, hl.nil);
        });
    });
  });


module.exports = {
  generateCsv,
  sendEmail,
  createUrl,
  parseBuffer,
  streamData,
};

