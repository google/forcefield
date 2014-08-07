// Users have experienced issues connecting to GmailServices even with
// the retry function below. Adding a very simple caching mechnaism to
// help with the very commonly used items.
SERVICE_CACHE = {};

function cachePut(key, value) {
  SERVICE_CACHE[key] = value;
}

function cacheGet(key) {
  return SERVICE_CACHE[key];
}

function cachedExecute(fp, optional_key) {
  var key = optional_key == undefined ? fp : optional_key;

  var answer = cacheGet(key);
  
  // We have already cached this answer
  if(answer != undefined) {
    //debug('Cache hit for key: ' + key);
    debug('Service cache hit');
    return answer;
  }
  
  // Run command to get answer
  answer = executeCommand(fp);
  // Put in cache for next time
  cachePut(key, answer);
  //debug('Cache miss for key: ' + key + ' but saved for next time.');
  debug('Service cache miss');
  return answer;
}

function cachedExecuteMessage(message, fp) {
  return cachedExecute(fp, serviceGetMessageID(message) + fp);
}

// -- MESSAGE SERVICES --
function serviceGetMessageID(message) {
  return executeCommand(function(){return message.getId();});
}

function serviceGetMessageIsDraft(message) {
  return cachedExecuteMessage(message, function(){return message.isDraft();});
}

function serviceGetMessageIsTrash(message) {
  return cachedExecuteMessage(message, function(){return message.isInTrash();});
}

function serviceGetMessageBody(message) {
  return cachedExecuteMessage(message, function(){return message.getBody();});
}

function serviceGetMessageDate(message) {
  return cachedExecuteMessage(message, function(){return message.getDate();});
}

function serviceGetMessageSubject(message) {
  return cachedExecuteMessage(message, function(){return message.getSubject(); });
}

function serviceGetThreads(message) {
  return cachedExecuteMessage(message, function() { return message.getThread(); } );
}

function serviceGetRawMessage(message) {
  return cachedExecuteMessage(message, function() { return message.getRawContent(); } );
}

function serviceGetMessageFrom(message) {
  return cachedExecuteMessage(message, function() { return message.getFrom(); } );
}

function serviceGetMessageCC(message) {
  return cachedExecuteMessage(message, function() { return message.getCc() });
}

function serviceGetMessageBCC(message) {
  return cachedExecuteMessage(message, function() { return message.getBcc() });
}

function serviceGetMessageTo(message) {
  return cachedExecuteMessage(message, function() { return message.getTo()});
}

function serviceGetMessageAttachments(message) {
  return cachedExecuteMessage(message, function() { return message.getAttachments() });
}

// -- GMAIL SERVICES --
function serviceGmailSearch(search_string) {
  return executeCommand( function() { return GmailApp.search(search_string); } );
}

function serviceCreateLabel(labelName) {
  return executeCommand( function() { return GmailApp.createLabel(labelName); } );
}

function serviceRemoveLabelFromThread(thread, label) {
  var gmail_label_object = executeCommand(function(){return GmailApp.getUserLabelByName(label);}) // can use serviceGetUserLabels() instead
  executeCommand(function(){thread.removeLabel(gmail_label_object)});
}

function serviceSendEmailMessage(to, subject, body, htmlBody, cc, bcc, from, attach, name) {
  return executeCommand( 
    function() {
      GmailApp.sendEmail(to, subject, body, {htmlBody: htmlBody, cc: cc, bcc: bcc, from: from, attachments: attach, name: name} );
    });
}

function serviceGetUserLabels() {
  return cachedExecute(function() { return GmailApp.getUserLabels(); } );
}

function serviceCreateLabel(label) {
  return executeCommand( function() { return GmailApp.createLabel(label); } );
}


// -- THREAD SERVICES
function serviceAddLabelToThread(thread, label) {
  return executeCommand( function() { thread.addLabel(label); } );
}

function serviceGetThreadMessages(thread) {
  return executeCommand(function(){return thread.getMessages();});
}


// -- PROPERTIES SERVICE --
function serviceSaveProperty(key, value) {
  executeCommand(function() { UserProperties.setProperties(key, value) });
}

function serviceGetProperties() {
  return executeCommand(function() { return UserProperties.getProperties(); });
}

function serviceClearProperties() {
  return executeCommand(function() { UserProperties.deleteAllProperties(); });
}

// -- SCRIPT SERVICES --
function serviceGetTriggers() {
  return executeCommand( (function(){ return ScriptApp.getScriptTriggers();}));
}

function serviceDeleteTrigger(functionName) {
  return executeCommand((function(){ ScriptApp.deleteTrigger(findTrigger(functionName)) }));
}

// -- LOGGING SERVICES --
function serviceGetLog() {
  return executeCommand( function() { return Logger.getLog(); })
}

// -- MISC SERVICES ==
function serviceGetEffectiveUserEmail() {
  return cachedExecute(function() { return Session.getEffectiveUser().getEmail() });
}

function serviceSendEmail(yourEmailAddress, subject, body, options) {
  return executeCommand( function() { MailApp.sendEmail(yourEmailAddress, subject, body, options);} );
}

function serviceCreateTrigger(functionName, minutes) {
 return executeCommand( ( function() {
    ScriptApp.newTrigger(functionName)
      .timeBased()
      .everyMinutes(minutes)
      .create();
  }));
}

function executeCommand(fp) {  
  var msg;
  var ret_val;
  var last_error;
  
  if(EXECUTE_COMMAND_LOGGING)
    debug(">>>>>>>>\n");
  
  for(var retries = NUM_RETRIES; retries > 0; retries -= 1) {
    try {
      ret_val = fp();
      if(EXECUTE_COMMAND_LOGGING)
        debug('Successfully executed command:' + fp);
      break;
    }
    catch(err) {
      last_error = err;
      debug('Exception:' + err + ' thrown executing function:' + fp);
      Utilities.sleep(SLEEP_TIME);
    }
  }
  
  if(EXECUTE_COMMAND_LOGGING)
    debug('<<<<<<<<<\n');
  
  if(retries == 0) {
    msg = 'Gmail Delay Send failed to connect to one of the Google Services. ';
    msg += 'This is OK if it happens infrequently,  the script will run again in a few minutes. ';
    msg += 'See here to avoid receiving these notifications: https://code.google.com/p/gmail-delay-send/wiki/GmailDelaySendOptions_8#Error_Notifications. ';
    msg += 'Function being called: ' + fp + '.';
    msg += 'Error message: ' + last_error;
    debug(msg);
    throw new Error(msg);
  }
  
  return ret_val;
}
