/**********************
 User Preferences
**********************/
function Prefs()
{
  var form_object = loadPrefsForForm();
  
  for (var prop in form_object) {
    if (form_object[prop] == 'true')
      this[prop] = true;
    else if (form_object[prop] == 'false')
      this[prop] = false;
    else
      this[prop] = form_object[prop];
  }
  
  //NOTE the this.* fields have to match the names in the HTML.
  
  this.triggerOn = function() {
    return this.triggers;
  }
  
  this.receiptsOn = function() {
    return this.email_receipts;
  }
  
  this.emailNotificationsOn = function() {
    return this.error_notification;
  }
  
  this.debuggingOn = function() {
    return this.debugging;
  }
  
  this.getRequireLabel = function() {
    return this.require_label;
  }
  
  this.getTopLabelName = function() {
    return TOP_LEVEL_LABEL;
  }
  
  this.getErrorLabelName = function() {
    return TOP_LEVEL_LABEL + '/' + DELAY_SEND_ERROR_LABEL;
  }

  this.getToSendLabelName = function() {
    return TOP_LEVEL_LABEL + '/' + DELAY_SEND_TO_SEND_LABEL;
  }
  
  this.getDelim = function() {
    return this.delim;
  }
  
  this.getTimeZone = function() {
    return this.localzone;
  }
  
  this.getTriggerMin = function() {
    return this.trigger_min;
  }
  
  /**
  match[1] -- header
  match[2] -- delim + date string
  match[3] -- rest of message
  **/
  this.getHTMLRegex = function() {
    return new RegExp('^([\\s\\S]*?>)([^<]+)(<[\\s\\S]*)');
  }
  
  /**
  match[1] -- date string
  match[2] -- rest of message
  **/
  this.getTextRegex = function() {
    return new RegExp('^\\s*' + this.delim + '([^<]*)(<[\\s\\S]*)');
  }
  
  this.printPrefs = function() {
    debug('-- Prefs --');
    debug('  Triggers: ' + this.triggerOn());
    debug('  Email Receipts: ' + this.receiptsOn());
    debug('  Error Notifications: ' + this.emailNotificationsOn());
    debug('  Debugging: ' + this.debuggingOn());
    debug('  Top level Name: ' + this.getTopLabelName());
    debug('  Label Required: ' + this.getRequireLabel());
    debug('  Error Label Name: ' + this.getErrorLabelName());
    debug('  To Send Label Name: ' + this.getToSendLabelName());
    debug('  Trigger Minutes: ' + this.getTriggerMin());
    debug('  Delim: ' + this.getDelim());
    debug('  TimeZone: ' + this.getTimeZone());
    debug('  getHTMLRegex: ' + this.getHTMLRegex());
    debug('  getTextRegex: ' + this.getTextRegex());
    debug('------------');
  }
}

function getUserPrefs(force_reload) {
  if(USER_PREFS == null || force_reload) {
    debug('User preferences object empty.. reloading..');
    USER_PREFS = new Prefs();
    USER_PREFS.regex = new RegExp(USER_PREFS.getDelim() + ' [^' + USER_PREFS.getDelim() + ']+$','i');
  }
  return USER_PREFS;
}

function savePrefsFromForm(form_object) {
  debug('Saving preferences from form object which contains: ');
  
  for (var prop in form_object)
    debug(' - ' + prop + ' => ' + form_object[prop]);
  
  serviceSaveProperty(form_object, true);
  
  var prefs = getUserPrefs(true);
  
  debug('Refreshed preference object now contains:');
  prefs.printPrefs();
  
  var message = 'Saved new preferences.';
  
  if (prefs.triggerOn()) {
    deleteTriggerIfSet(TRIGGER_FUNCTION);
    setupTrigger(TRIGGER_FUNCTION, prefs.getTriggerMin());
  }
  else {
    removeTrigger(TRIGGER_FUNCTION);
  }
  
  return message;
}

function loadPrefsForForm() {
  prefs = serviceGetProperties();
  
  for(default_prop in DEFAULT_PREFS) {
    if(prefs[default_prop] == undefined) {
      prefs[default_prop] = DEFAULT_PREFS[default_prop];
      debug('Loading default property for key:' + default_prop + ' value: ' + prefs[default_prop]);
    }
  }
  
  return prefs
}

function clearPreferences(form_object) {
  serviceClearProperties();
  
  //TODO Can I refresh page automatically?
  return 'Defaults restored. Please refresh page.';
}
