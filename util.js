const csvStringify = require('csv-stringify');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const hl = require('highland');
const request = require('request-promise');
const moment = require('moment');
const nodemailer = require('nodemailer');


const { OUTPUT_DIR, endPoints: { base }, baseRequest, baseBody } = require('./constants');

const generateCsv = (stream, columns) => stream
  .through(csvStringify({ columns, header: true }));


const createUrl = (url, endPoint) => `${url}/${endPoint}`;

const parseBuffer = stream => stream
  .collect()
  .map(buffers => buffers.join(''))
  .map((res) => {
    console.log();
    return JSON.parse(res);
  });

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

const sendEmail = (stream, attachments) => stream
  .collect()
  .map((content) => {
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
      subject: `Signin ${campName}}`,
      attachments: [
        {
          filename: `sign-in-${campName}.csv`,
          content: res.join('\n'),
        },
      ],
    };
    transporter.sendMail(mailOptions,
      (error, info) => {
        if (error) {
          cb(error);
        } else {
          cb(null, `Email sent: ${info.response}`);
        }
      });
  });


module.exports = {
  generateCsv,
  createUrl,
  parseBuffer,
  streamData,
};

