/**********************
 Interactions with the WEB-UI
**********************/
function doGet() {
  return HtmlService.createTemplateFromFile('User_UI.html').evaluate();
}

function parseUserDate(datestr) {
  debug('Parsing user date string:"' + datestr +'"');
  
  var user_timezone_string = parseDateToUserTimezoneString(datestr);
  
  if (user_timezone_string != null)
    return 'Your date was parsed successfully to:\n' + user_timezone_string;
  else
    return 'Sorry, I could not understand the date that you typed: ' + datestr + '.\nFor help see this page:\nhttps://code.google.com/p/gmail-delay-send/wiki/GmailDelaySendSpecifyingDates';
}

function savePrefs(form_object) {
  return savePrefsFromForm(form_object);
}

function getPrefs() {
  return loadPrefsForForm();
}

function restoreDefaultPrefs(form_object) {
  return clearPreferences();
}
