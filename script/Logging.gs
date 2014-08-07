/**********************
 Logging
**********************/

/* Depending on the user settings send them logs/receipts */
function sendLogs() {
  var prefs = getUserPrefs();
  
  sendEmailToSelf(SCRIPT_NAME + ' -> Parsing Errors', array_to_table(parsing_errors));
  
  if(prefs.receiptsOn())
    sendEmailToSelf(SCRIPT_NAME + ' -> Receipts ', array_to_table(receipts));

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
