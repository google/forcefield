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
 Logging
**********************/

/* Depending on the user settings send them logs/receipts */
function sendLogs() {
  var prefs = getUserPrefs();
  
  if(prefs.emailNotificationsOn())
    sendEmailToSelf(SCRIPT_NAME + ' -> Errors', array_to_table(error_msgs));

  if(prefs.debuggingOn())
    sendEmailToSelf(SCRIPT_NAME + ' -> Debug Logs', array_to_table(serviceGetLog().split('\n')));
}

function array_to_table(arr) {
  
  if(!arr || !arr.length)
    return '';
  
  var toReturn = '<table>';
  
  for(var i=0; i<arr.length; i++)
    toReturn += '<tr>' + arr[i] + '</tr>';
  
  toReturn += '</table>';
  
  return toReturn;
}

function debug(msg) {
  Logger.log(msg);
}
