'use strict'

var request = require('request');
var fs = require('fs');
var _ = require('lodash');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

module.exports.caseStatus = function (receipt) {
  return new Promise((resolve, reject) => {
    request.post({
      url: 'https://egov.uscis.gov/casestatus/mycasestatus.do',
      form: {
        appReceiptNum: receipt,
        caseStatusSearchBtn: 'CHECK STATUS'
      },
      timeout: 45000
    }, (err, res, body) => {
      if (err) {
        return reject(err);
      }
      let jsdom = new JSDOM(body);
      let dom = jsdom.window.document.querySelector('.appointment-sec .rows h1');
      const title = dom.textContent;
      dom = jsdom.window.document.querySelector('.appointment-sec .rows p');
      const content = dom.textContent;
      resolve({receipt, title, content});
    });
  });
}

module.exports.analyze = function (files) {
  return Promise.all(
    files.map(f => {
      return new Promise((resolve, reject) => {
        fs.readFile(f, 'utf8', (err, data) => {
          if (err) {
            return reject(new Error(err));
          }
          resolve(JSON.parse(data));
        });
      })
      .catch((err) => err);
    })
  )
  .then((data) => {// data = [{}, {}, {}]
    if (data instanceof Error) {
      return;
    }
    // merge
    let all = _.flatMap(data, (entry) => {
      _.map(entry.data, (i) => {
        i.date = new Date(entry.date);
      });
      return entry.data;
    });
    let group = _.groupBy(all, (i) => i.receipt);
    console.log(group)
    return group;
  });
}
