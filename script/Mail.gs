/*
Copyright 2014 Google Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**********************
 Mail
**********************/

function sendEmailToSelf(subject, body) {
  var email_footer_text_size = 10;
  
  if(body.length == 0)
     return;

  var yourEmailAddress = serviceGetEffectiveUserEmail();
  
  // Add footer to emails with helpful links
  body += '<br/>';
  body += '<hr/>';
  body += '<table width="600" style="width:600px" cellspacing="0" cellpadding="0" align="center">';
  body += '<tr style="font-size:' + email_footer_text_size +'px;"> <a href="https://google.github.io/forcefield/"> ' + SCRIPT_NAME + ' Homepage </a>';
  body += '|| Script Version: ' + SCRIPT_VERSION + ' </tr>';
  body += '</table>';
  
  options = {noReply: true, replyTo: SCRIPT_NAME, htmlBody: body};
  
  serviceSendEmail(yourEmailAddress, subject, body, options);
}

function readSenderEmails() {
  var sender_emails = serviceGetProperty('senderEmails');
  if (sender_emails) {
    sender_emails = JSON.parse(sender_emails);
  }
  sender_emails = sender_emails || [];
  return sender_emails;
}

function addSenderEmail(email_address) {
  var sender_emails = readSenderEmails();
  sender_emails.push(email_address);
  sender_emails = JSON.stringify(sender_emails);
  serviceSetProperty('senderEmails', sender_emails);
}
  
function senderEmailPresent(email_address) {
  var sender_emails = readSenderEmails();
  var present = sender_emails.indexOf(email_address) >= 0;
  return present;
}

function sendAutoresponse(email_address) {
  var subject = '[Forcefield] Delivery Notification';
  var body = "Thanks for your note! My team has pledged to keep emails within working hours. I'm using Forcefield -- so your message will hit my inbox when my working hours resume.";
  var options = {
    htmlBody: "Thanks for your note! My team has pledged to keep emails within working hours. I'm using <a href='https://google.github.io/forcefield/'>Forcefield</a> -- so your message will hit my inbox when my working hours resume."
  }
  Logger.log('Sending autoresponse to ' + email_address);
  serviceSendEmail(email_address, subject, body, options);
}
