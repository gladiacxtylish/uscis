'use strict'

const request = require('request')
const jsdom = require('jsdom')
const { JSDOM } = jsdom;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

module.exports = (receipt) => {
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
        return reject(err)
      }
      let jsdom = new JSDOM(body);
      let dom = jsdom.window.document.querySelector('.appointment-sec .rows h1')
      const title = dom.textContent
      dom = jsdom.window.document.querySelector('.appointment-sec .rows p')
      const content = dom.textContent
      resolve({receipt, title, content});
    })
  })
}
