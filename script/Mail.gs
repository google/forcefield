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
  body += '<tr style="font-size:' + email_footer_text_size +'px;"> <a href="http://code.google.com/p/gmail-delay-send"> ' + SCRIPT_NAME + ' Homepage </a>';
  body += '|| <a href="https://code.google.com/p/gmail-delay-send/wiki/GmailDelaySendErrors_8"> Common Problems </a>';
  body += '|| Script Version: ' + SCRIPT_VERSION + ' </tr>';
  body += '</table>';
  
  options = {noReply: true, replyTo: SCRIPT_NAME, htmlBody: body};
  
  serviceSendEmail(yourEmailAddress, subject, body, options);
}


// returns true/false if the message was sent
function sendMessage(message, metaObj)
{
  // Copies the given thread into another email
  // sends that mail, archive the old thread, and remove the label.
  var from_arr = serviceGetMessageFrom(message).split(' <');
  
  if (from_arr.length > 1) {
    var name = from_arr[0];
    var from = from_arr[1].replace('>','');
  }
  else {
    var name = '';
    var from = from_arr[0];
  }
   
  var body = escapeHTMLChars(metaObj.newBody);
  var cc = serviceGetMessageCC(message);
  var bcc = serviceGetMessageBCC(message);
  var to = serviceGetMessageTo(message);
  var subject = serviceGetMessageSubject(message);
  var attach = serviceGetMessageAttachments(message);
    
  // To we want to include HTML body in email?
  var htmlBody = isMessageHTML(message) ? body : null;
  
  debug('== Sending mail ==');
  debug('  To: ' + to);
  debug('  Subject: ' + subject);
  debug('  Body length: ' + body.length);
  debug('  HTML body length: ' + (htmlBody == null ? 'Empty' : htmlBody.length));
  debug('  CC: ' + cc);
  debug('  BCC: ' + bcc);
  debug('  From: ' + from);
  debug('  Attachments length: ' + attach.length);
  debug('  Name: ' + name);
  debug('==================');
  
  serviceSendEmailMessage(to, subject, body, htmlBody, cc, bcc, from, attach, name);
  
  var log = '<table border="1">';
  log += '<tr><th> Date Sent </th><th> To </th><th> CC </th><th> BCC </th><th> From </th><th> Subject </th><th> Body Snippit (first 500 chars) </th><th> Attachments </th></tr>';
  log += '<tr>';
  log += '<td style="vertical-align:text-top">' + dateToStringWithoutTimezone(getUserDate())
  + '</td>';
  log += '<td style="vertical-align:text-top">' + to + '</td>';
  log += '<td style="vertical-align:text-top">' + cc + '</td>';
  log += '<td style="vertical-align:text-top">' + bcc + '</td>';
  log += '<td style="vertical-align:text-top">' + from + '</td>';
  log += '<td style="vertical-align:text-top">' + subject + '</td>';
  log += '<td style="vertical-align:text-top">' + body.substring(0,500) + '</td>';
   
  log += '<td style="vertical-align:text-top">';
  
  // Objects are in the form of blobs
  for(var i=0; i<attach.length; i++)
    log += ' ' + attach[i].getName() + '<br/>';
  
  log += '</td>';
            
  log += '</tr></table>';
  
  receipts.push(log);
  
  GmailApp.moveMessageToTrash(message);

  return true;
}
