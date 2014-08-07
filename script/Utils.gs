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

function getMessageDateAndNewBody(message) {
  return isMessageHTML(message) ? getHTMLMessageDateAndNewBody(message) : getTextMessageDateAndNewBody(message);
}

function getHTMLMessageDateAndNewBody(message) {
  var date_string = null;
  var new_body = null;
  
  var match = doParsingWork(serviceGetMessageBody(message), getUserPrefs().getHTMLRegex());
  
  if(match && match.length > 3) {
    // We found a match, but not sure that delim is in the date_string
    var possible_datestring = escapeHTMLChars(match[2]);
    debug('Found possible datestring: ' + possible_datestring);
    
    // Check if out delim is in the string
    var match2 = (new RegExp(getUserPrefs().getDelim() + '(.*)')).exec(possible_datestring);
    
    if(match2 && match2.length > 1) {
      date_string = match2[1];
      new_body = match[1] + match[3];
    }
    else
      debug('Could not find delim in possible datestring');
  }
  
  // When using the default text size in the old compose window there are no leading
  // HTML tags before the first character in the email. In this case the text regex will also
  // work. Try that..
  if(date_string == null && new_body == null) {
    debug('HTML Parsing failed, Attempting text parsing.');
    arr = getTextMessageDateAndNewBody(message, true);
    date_string = arr[0];
    new_body = arr[1];
    debug('Text parsing result for date_string:' + date_string);
  }

  debug('Returning date_string: ' + date_string);

  return [date_string, new_body];
}

function getTextMessageDateAndNewBody(message, skip_split) {
  // When looking for a text email match we want to escape any HTML chars so that our regex
  // can match.
  var match = doParsingWork(escapeHTMLChars(serviceGetMessageBody(message)), getUserPrefs().getTextRegex());
  var date_string = null;
  var new_body = null;
  
  if(match && match.length > 2)
  {
    date_string = match[1];
    if(skip_split)
      new_body = match[2];
    else
      new_body = match[2].split(TEXT_LINE_BREAKS).join('');
  }

  debug('Returning date_string: ' + date_string);
  
  return [date_string, new_body];
}

function doParsingWork(body, regex) {
  var match = regex.exec(body);
  
  debug('Parsing date and body from email with regex:' + regex);
  
  if(match != null) {
    for(var i=0; i<match.length; i++)
      debug('Match[' + i + '] substring:' + match[i].substring(0,100));
  }
  else {
    debug('Empty Matches');
  }
  
  return match;
}

function getMessageWithoutDate(message) {
return splitMessageByNewlines(message).slice(1).join(getLineJoinForEmailType(message));
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
  
  debug('Date returned to user:' + dateToStringWithoutTimezone(date));
  
  // Format a date, but cut off timezone
  if(date)
    return dateToStringWithoutTimezone(date);
  else
    return null;
}

function parseDate(str) {
  return Date.parse(str);
}

function createLabels() {
  labels_to_create = [getUserPrefs().getTopLabelName(),
                      getUserPrefs().getToSendLabelName(),
                      getUserPrefs().getErrorLabelName(),
                      ];

  for(var i=0; i<labels_to_create.length; i++) {    
    var user_label = labels_to_create[i];    
    if(user_label && !userHasLabel(user_label)) {
      debug('Could not find: ' + user_label + ' label, creating now..');
      if(!createLabel(user_label)) {
        // Error creating the label
        debug('Error creating label:' + user_label);
        return false;
      } 
    }
  }
  return true;
}

/* Returns all the threads objects that are in the label and in the draft folder 

NOTE: Seems to be a bug in Gmail when a message which has a label applied doesn't show up 
when searching for both the label and in:drafts. Until this is resolved, search only for things
in:drafts or have label, but not both.
*/
function getThreadsInLabel() {
  var search_string = '';
  var prefs = getUserPrefs();
  
  var label_name = prefs.getToSendLabelName();
  var error_label = prefs.getErrorLabelName();
  
  if(prefs.getRequireLabel())
    search_string = ' label:' + label_name + ' ';
  else
    search_string = ' in:drafts ';
  
  // do not include any message in the error bucket
  search_string += ' -label:' + error_label + ' ';
  
  debug('Searching for emails with this string: "' + search_string + '"');
  
  var threads = serviceGmailSearch(search_string);
  
  return threads;
}

// Create the error label if it doens't exist already
// Apply the error label to the message.
function applyErrorLabel(message) {
  return applyLabelToMessage(message, getUserPrefs().getErrorLabelName());
}

function applyLabelToMessage(message, labelName) {
  var label = serviceCreateLabel(labelName);
  
  if(label == null) {
    debug('Was not able to create label: ' + labelName);
    return false;
  }
  
  debug('Succesfully found label: ' + labelName);
  
  var thread = serviceGetThreads(message);
  
  serviceAddLabelToThread(thread, label);
    
  debug('Successfully added label (' + labelName + ') to message with subject: ' + serviceGetMessageSubject(message));
  
  return true;
}


/* Returns true/false if the user has the label created */
function userHasLabel(label) {
  labels = serviceGetUserLabels();
  for(var i=0; i<labels.length; i++)
    if(labels[i].getName() == label)
      return true;
  return false;
}

/* Creates label, true/false if label creation was successful */
function createLabel(label) {
  var label = serviceCreateLabel(label);
  
  if(label) {
    debug('New label created successfully');
    return true;
  }
  else {
    receipts.push(' Error trying to create a new label: "' + label + '". Cannot continue.  :-(');
    debug('Error creating label!');
    return false;
  }
}

// Opposed to a plain text email
function isMessageHTML(message) {
  var raw_message = serviceGetRawMessage(message);
  var is_html = raw_message.indexOf('Content-Type: text/html') > 0;
  debug('Is HTML email:' + is_html);
  return is_html;
}

// Escape the most common HTML chars
// GmailMessages only have a 'getBody()' which gets the message as HTML
// So stuff like '<' is esacped to '&lt;'. Need to turn this back into
// pure text.
// Full enumeration of all the chars if needed at: http://stackoverflow.com/questions/784586/convert-special-characters-to-html-in-javascript
function escapeHTMLChars(str) {
  str = str.replace(/&amp;/g, '&');
  str = str.replace(/&gt;/g, '>');
  str = str.replace(/&lt;/g, '<');
  str = str.replace(/&quot;/g, '"');
  str = str.replace(/&#39;/g, "'");
  str = str.replace(/&#039;/g, "'");
  str = str.replace(/&nbsp;/g, ' ');
  return str;
}
