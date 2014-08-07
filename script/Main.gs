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
 Main Code
**********************/
START_TIME = 0;
// Function called on event timer
function main() {
  debug('Starting main()');
  START_TIME = new Date().getTime();
  
  // Print the prefs that we're running with.
  var prefs = getUserPrefs();
  prefs.printPrefs();
  
  // User has to have 'Error Notifications' turned on to get notified of top level exceptions.
  try {
    if (timeToMoveThreads()) {
      // Clear our list of previously autoresponded email addresses
      serviceDeleteProperty('senderEmails');
      
      // Found the label, let's see if anything is in it
      var threads = getThreadsInLabel();
      
      if(threads.length > 0) {
        debug('Found ' + threads.length + ' threads to process.');
        processThreads(threads);
        if (outOfTime()) {
          debug('Running out of time, halting.');
        }
      }
      else {
        debug('No threads found to process...exiting.');
      }
    } else {
      if (prefs.autoresponderOn()) {
        debug('Check for any autoresponses that need to be sent.');
        sendAutoresponsesForNewMessages();
      }
    }
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


function timeToMoveThreads() {
  // User date is in their timezone
  var user_time = getUserDate();
  debug('Current user time:' + user_time);
  var day_of_week = user_time.getDay();
  var hour = user_time.getHours();
  debug('Current day is ' + day_of_week + ' and current hour is ' + hour);

  var prefs = getUserPrefs();
  var start_hour = prefs.getStartHour(day_of_week);
  var end_hour = prefs.getEndHour(day_of_week);
  debug('Using start hour ' + start_hour + ' and end hour ' + end_hour);
  
  if (hour >= start_hour && hour < end_hour) {
    debug('Time to move threads');
    return true;
  }
  debug('Not time to move threads');  
  return false;
}


function outOfTime() {
  // Returns true if we're about out of time, or false otherwise.
  return ((new Date().getTime() - START_TIME) / 1000) > 50;
}


function markMessagesInLabelUnread() {
  // We only want to get the messages that have been marked read to mark unread.
  var message_ids = getMessageIDsInLabel(true);
  var messages = [];
  for (var i=0; i<message_ids.length; i++) {
    if (outOfTime()) {
      return;
    }
    // Batch messages so we can mark them unread 10 at a time, to make the script run faster.
    messages.push(serviceGetMessageById(message_ids[i]));
    if (messages.length >= 10) {
      serviceMarkMessagesUnread(messages);
      messages = [];
    }
  }
  // Take care of any remaining messages
  if (messages.length > 0) {
    serviceMarkMessagesUnread(messages);
  }
}
  
function sendAutoresponsesForNewMessages() {
  var message_ids = getMessageIDsInLabel();
  var message;
  var sender;
  for (var i=0; i<message_ids.length; i++) {
    message = serviceGetMessageById(message_ids[i]);
    sender = serviceGetMessageReplyTo(message);
    if (!senderEmailPresent(sender)) {
      addSenderEmail(sender);
      sendAutoresponse(sender);
    }
  }
}


function processThreads(threads) {
  markMessagesInLabelUnread();
  if (outOfTime()) {
    return;
  }
  serviceMoveThreadsToInbox(threads);
  if (outOfTime()) {
    return;
  }
  var prefs = getUserPrefs();
  var label_name = prefs.getLabelName();
  var label = serviceGetUserLabelByName(label_name);
  serviceRemoveLabelFromThreads(threads, label);
}

