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

// Users have experienced issues connecting to GmailServices even with
// the retry function below. Adding a very simple caching mechanism to
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
function serviceMarkMessagesUnread(messages) {
  return executeCommand(function(){GmailApp.markMessagesUnread(messages);});
}

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

function serviceGetMessageReplyTo(message) {
  return cachedExecuteMessage(message, function() { return message.getReplyTo(); } );
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

function serviceGetMessageById(message_id) {
  return executeCommand( function() { return GmailApp.getMessageById(message_id); } );
}

function serviceCreateLabel(labelName) {
  return executeCommand( function() { return GmailApp.createLabel(labelName); } );
}

function serviceRemoveLabelFromThreads(threads, label) {
  return executeCommand( function() { return label.removeFromThreads(threads); } );
}

function serviceGetUserLabelByName(labelName) {
  return executeCommand( function() { return GmailApp.getUserLabelByName(labelName); } );
}

function serviceMoveThreadToInbox(thread) {
  return executeCommand(function() {
    GmailApp.moveThreadToInbox(thread);
  });
}

function serviceMoveThreadsToInbox(threads) {
  return executeCommand(function() {
    GmailApp.moveThreadsToInbox(threads);
  });
}

function serviceGetUserLabels() {
  return cachedExecute(function() { return GmailApp.getUserLabels(); } );
}


// -- THREAD SERVICES
function serviceAddLabelToThread(thread, label) {
  return executeCommand( function() { thread.addLabel(label); } );
}

function serviceGetThreadMessages(thread) {
  return executeCommand(function(){return thread.getMessages();});
}


// -- PROPERTIES SERVICE --
function serviceSaveProperties(properties, deleteAllOthers) {
  executeCommand(function() { PropertiesService.getUserProperties().setProperties(properties, deleteAllOthers) });
}

function serviceGetProperties() {
  return executeCommand(function() { return PropertiesService.getUserProperties().getProperties(); });
}

function serviceGetProperty(property) {
  return executeCommand(function() { return PropertiesService.getUserProperties().getProperty(property); });
}

function serviceSetProperty(key, value) {
  return executeCommand(function() { return PropertiesService.getUserProperties().setProperty(key, value); });
}

function serviceClearProperties() {
  return executeCommand(function() { return PropertiesService.getUserProperties().deleteAllProperties(); });
}

function serviceDeleteProperty(key) {
  return executeCommand(function() { return PropertiesService.getUserProperties().deleteProperty(key); });
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
    msg = 'Forcefield failed to connect to one of the Google Services. ';
    msg += 'This is OK if it happens infrequently, the script will run again in a minute. ';
    msg += 'If it happens frequently, please post on our message board: ';
    msg += 'https://groups.google.com/forum/#!forum/forcefield-apps-script\n'
    msg += 'See here to avoid receiving these notifications: https://google.github.io/forcefield/error-notifications/\n';
    msg += 'Function being called: ' + fp + '.';
    msg += 'Error message: ' + last_error;
    debug(msg);
    throw new Error(msg);
  }
  
  return ret_val;
}
