var express = require('express');
var fs      = require('fs');
var CronJob = require('cron').CronJob;
var request = require('request');
var cheerio = require('cheerio');
var aws     = require('aws-sdk');
var ses     = new aws.SES({
                    accessKeyId: process.env['AWS_ACCESS_KEY'],
                    secretAccessKey: process.env['AWS_SECRET_KEY'],
                    region: process.env['AWS_REGION']
                  });
var app     = express();

var count = 0;
var url = 'http://shop.bluegrass.com/returned-ticket-resale';
var alerted = false;

app.get('/test', function(req, res) {
  res.json({running: true, checkCount: count, url: url, alertSent: alerted});
});

// '* * * * * *' -- every sec
// '0 */2 * * * *' -- every 2 min
new CronJob('0 */2 * * * *', function() { //every 2 min
  count++;
  if (!alerted) {
    request(url, function(error, response, html){
      if(!error){
        if (html.includes('onsite') || html.includes('OnSite') || html.includes('on site') || html.includes('On Site') || html.includes('On-site') || html.includes('On-Site') || html.includes('on-site') || html.includes('ON-SITE')) {
          console.log('tickets are available!!!');
          
          var params = {
            Source: 'branonbarrett@gmail.com',
            Destination: {
              ToAddresses: ['branonbarrett@gmail.com','eruditefool12@gmail.com','tgmartin000@gmail.com']
              //ToAddresses: ['branonbarrett@gmail.com']
            },
            Message: {
              Subject: {
                Data: 'Rockgrass Onsite Resale Tickets Are Available!!!!!'
              },
              Body: {
                Text: {
                  Data: 'This is an auto generated email from your friendly automated RG alerting service. Buy your tickets now mofos!!!!!!\n\nhttp://shop.bluegrass.com/returned-ticket-resale\n\nP.S. You owe me a beer!!!!!!',
                }
              }
            }
          };

          ses.sendEmail(params, function(err, data) {
            if (err) {
              console.error('email error', err);
            } else {
              console.log('email sent successfully!!!');
            }
          });

          alerted = true;
        }
      }
    });
  }
}, null, true);

app.listen('8081');

console.log('alerting service is running...');

exports = module.exports = app;