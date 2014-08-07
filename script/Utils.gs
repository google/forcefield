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
 Utils
**********************/
function getTimeZoneString() {
  var timezone_string = getUserPrefs().getTimeZone();
  
  debug('User timezone:' + timezone_string);
  
  if(timezone_string == DEFAULT_TIMEZONE) {
    timezone_string = CalendarApp.getDefaultCalendar().getTimeZone();
    debug('Loading timezone from calendar: ' + timezone_string);
  }
  
  return timezone_string;  
}

function convertToUserDate(date) {
  var user_timezone_string = getTimeZoneString();
  var user_date_string = Utilities.formatDate(date, user_timezone_string, "yyyy/MM/dd HH:mm:ss");
  var user_date = new Date(user_date_string);
  debug('Converted:' + date + ' to user time:' + user_date);
  return user_date;
}

function getUserDate() {
  return convertToUserDate(new Date());
}

function dateToStringWithoutTimezone(date) {
  return date.toDateString() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
}

function parseDateToUserTimezoneString(str) {
  // need to special case 'now'
  if(/now/i.exec(str))
    return dateToStringWithoutTimezone(getUserDate());
  
  Date.setRelativeTo(getUserDate());
  
  debug('Relative to:' + dateToStringWithoutTimezone(Date.relativeTo));
  
  var date = parseDate(str);
  
  debug('Date returned to user: ' + dateToStringWithoutTimezone(date));
  
  // Format a date, but cut off timezone
  if(date)
    return dateToStringWithoutTimezone(date);
  else
    return null;
}

function parseDate(str) {
  return Date.parse(str);
}


/* Returns all the threads objects that are in the label */
function getThreadsInLabel() {
  var prefs = getUserPrefs();
  
  var label_name = prefs.getLabelName();
  var search_string = ' label:' + label_name + ' ';
  //if (muted) {
  //  search_string += ' is:muted ';
  //} else {
  //  search_string += ' -is:muted ';
  //}
  
  debug('Searching for emails with this string: "' + search_string + '"');
  
  var threads = serviceGmailSearch(search_string);
  
  return threads;
}

/* Returns all the message IDs that are in the label */
function getMessageIDsInLabel(onlyRead){
  // TODO(mjj): see if we need to worry about paging in the results we retrieve this way
  var prefs = getUserPrefs();
  var label_name = prefs.getLabelName();
  var authToken = ScriptApp.getOAuthToken();
  var url = "https://www.googleapis.com/gmail/v1/users/me/messages?q=";
  if (onlyRead) {
    Logger.log('only looking for messages marked read');
    url += "label%3Aread%20";
  }
  url += "label%3A" + label_name;
  var response = UrlFetchApp.fetch(url, {
    method: "get",
    headers: {
      "Authorization": "Bearer " + authToken,
    },
  });
  var response_json = JSON.parse(response.getContentText());
  Logger.log(response_json);
  var message_ids = [];
  if (response_json.messages) {
    var message_ids = response_json.messages.map(function(x) { return x.id; });
  }
  Logger.log('found the following message IDs with the label ' + label_name);
  Logger.log(message_ids);
  return message_ids;  
}

/* Returns true/false if the user has the label created */
function userHasLabel(label) {
  labels = serviceGetUserLabels();
  for(var i=0; i<labels.length; i++)
    if(labels[i].getName() == label)
      return true;
  return false;
}

LABEL_ID = null;
function getLabelId() {
  if (LABEL_ID) {
    Logger.log('Cached Label ID: ' + LABEL_ID);
    return LABEL_ID;
  }
  
  var prefs = getUserPrefs();
  var label_name = prefs.getLabelName();
  
  var authToken = ScriptApp.getOAuthToken();
  var url = "https://www.googleapis.com/gmail/v1/users/me/labels?fields=labels(id%2Cname)";
  var response = UrlFetchApp.fetch(url, {
    method: "get",
    headers: {
      "Authorization": "Bearer " + authToken,
    },
  });
  var response_json = JSON.parse(response.getContentText());
  Logger.log(response_json);
  LABEL_ID = response_json.labels.filter(function(x) { return x.name == label_name; })[0].id;
  Logger.log('Label ID: ' + LABEL_ID);
  return LABEL_ID;
}
