/**********************
 Main Code
**********************/
// Function called on event timer
function main() {
  debug('Starting main()');
  
  // Print the prefs that we're running with.
  var prefs = getUserPrefs();
  prefs.printPrefs();
  
  // User has to have 'Error Notifications' turned on to get notified of top level exceptions.
  try {
  
    // Try to create the labels that we need, if failure then return.
    if(!createLabels())
      return 'Error creating labels!';
    
    // Found the label, lets see if anything is in it
    var threads = getThreadsInLabel();
    
    if(threads.length > 0) {
      debug('Found ' + threads.length + ' threads to process');
      processThreads(threads);
    }
    else
      debug('No threads found to process.. exiting');
  }
  catch(err) {
    if (err.hasOwnProperty('stack'))
      error_msgs.push('-- Error:' + err + ' --Stack:' + err.stack);
    else
      error_msgs.push(err);
  }
  
  sendLogs();
  
  return 'Finished!';
}

function ThreadMetaData()
{
  this.originalBody;      /* The original body of the message */
  this.newBody;           /* Body after we have removed date data */
  this.found_delim;       /* Boolean, if the message contains the delimeter (eg. we tried to parse the message) */
  this.successful_parse;  /* Boolean, if we were able to successfully parse the message */
  this.sendDate;          /* Date object when we should actually send this message */
  this.error_msg;         /* The error message (if !valid) why this thread is NOT valid */
}

/* Return a completed ThreadMetaData object for this message */
function parseMessage(message) {
  var prefs = getUserPrefs();
  var message_date_user_timezone = convertToUserDate(serviceGetMessageDate(message));
  var metaData = new ThreadMetaData();
    
  var message_date_and_new_body_arr = getMessageDateAndNewBody(message);
  var date_line = message_date_and_new_body_arr[0];
  var message_new_body = message_date_and_new_body_arr[1];
  
  if(!date_line) {
    metaData.found_delim = false;
    metaData.successful_parse = false;
    metaData.error_msg = 'Could not find your special character: "' + prefs.getDelim() + '" in FIRST line of email body';
  }
  else {
    // We successfully found the delimeter
    metaData.found_delim = true;

    debug('Date String: ' + date_line + ' Timestamp on message: ' + dateToStringWithoutTimezone(message_date_user_timezone));
    
    Date.setRelativeTo(message_date_user_timezone);
    
    metaData.sendDate = parseDate(date_line);
 
    // We could not parse the data successfully
    if(metaData.sendDate == null) {
      debug('Error Parsing date string: ' + date_line);
      metaData.error_msg = 'Error parsing date string: ' + date_line;
      metaData.successful_parse = false;
    }
    else {
      // Success parsing
      debug('Date to send: ' + dateToStringWithoutTimezone(metaData.sendDate));
      metaData.originalBody = serviceGetMessageBody(message);
      metaData.successful_parse = true;
      metaData.newBody = message_new_body;
      metaData.error_msg = null;
    }
  }
  return metaData;
}


function timeToSendMessage(messageSendDate) {
  // Message time is in user timezone
  var message_time = messageSendDate.getTime();

  // User date is in their timezone
  var user_time = getUserDate();
  
  // Add a 5 second fudge factor
  var send_time = user_time.getTime() + 5 * 1000;
  
  var timeToSend = message_time <= send_time;
  
  debug('Message date ms: ' + message_time + ' + Current time ms:' + send_time);
  
  debug('Detected time to send message: ' + timeToSend + '. Send Date: ' + dateToStringWithoutTimezone(messageSendDate) + ' Current user date:' + dateToStringWithoutTimezone(user_time));
   
  return timeToSend;
}


function handleMalformedMessage(message, metaObj) { 
  var process_message_as_error = false;
  var prefs = getUserPrefs();
      
  // If we are using a label then any malformed email is an error
  if(prefs.getRequireLabel()) {
    debug('Processing message as error because user requires a label');
    process_message_as_error = true;   
  }
  // If we don't have a label, then only if the delim was found is the message considered an error
  // (b/c a malformed date string)
  else if(metaObj.found_delim && !metaObj.successful_parse) {
    debug('Processing message as error because found delimeter in message, but could not parse it successfuly');
    process_message_as_error = true;    
  }

  if(process_message_as_error) {
    if(applyErrorLabel(message))
      parsing_errors.push('Sorry! There was an error parsing your message with subject: "' + message.getSubject() + '". <br/> ' +
                          'The reason for this error was: "' + metaObj.error_msg + '". <br/>' +
                          'A new label was applied to this message:' + 
                          '<a href="https://mail.google.com/mail/?#label/' + prefs.getErrorLabelName() + '">' + prefs.getErrorLabelName() + '</a>. <br/>' +
                          'Gmail Delay Send will ignore this message until you fix the problem and remove that label. <br/>' +
                          'If you have any questions please see the page on <a href="https://code.google.com/p/gmail-delay-send/wiki/GmailDelaySendErrors_8">common problems</a>');
    
    else
      parsing_errors.push('There was a problem with a message and we tried to apply the error label, but that was un-successful also. It is not a good day  :-(');
  }
}


function tryParseMessage(message) {
  var metaObj = parseMessage(message);
  
  if(!metaObj.found_delim || !metaObj.successful_parse) {
    debug('The message was malformed in some way. Found delimeter:' + metaObj.found_delim + '. Successful date parse: ' + metaObj.successful_parse);
    handleMalformedMessage(message, metaObj);
    return null;
  }
  else  
    return metaObj;
}
  

function tryToSendMessage(metaObj, message) {
  if(!timeToSendMessage(metaObj.sendDate) || !sendMessage(message, metaObj))
    return false;
  return true;
}

/* Check and send an individual thread if it's time */
function processThread(thread)
{
  var removeLabel = true;
  var prefs = getUserPrefs();
  var label = prefs.getToSendLabelName();
  var messages = serviceGetThreadMessages(thread);

  for(var i=0; i<messages.length; i++) {
    var message = messages[i];

    if(!serviceGetMessageIsDraft(message))
      continue;
    
    if(serviceGetMessageIsTrash(message))
      continue;
      
    var metaObj = tryParseMessage(message);
    
    // Message was malformed
    if(metaObj == null)
      continue;
    
    if(!tryToSendMessage(metaObj, message)) {
      debug('Message was parsed successfully, but no email was sent. Do not remove label.');
      removeLabel = false;
    }
  }
  
  if(!prefs.getRequireLabel()) {
    debug('Because we are not using a label, skipping the removal process');
  }
  else if(removeLabel) {
    debug('Removing label');
    serviceRemoveLabelFromThread(thread, label);
  }
}

function processThreads(threads)
{
  for(var i=0; i<threads.length; i++)
    processThread(threads[i]);
}
