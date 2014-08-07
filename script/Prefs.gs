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
  this.autoresponderOn = function() {
    return this.send_autoresponse;
  }
  
  this.emailNotificationsOn = function() {
    return this.error_notification;
  }
  
  this.debuggingOn = function() {
    return this.debugging;
  }
    
  this.getLabelName = function() {
    return TOP_LEVEL_LABEL;
  }
  
  this.getTimeZone = function() {
    return this.localzone;
  }
  
  this.getStartHour = function(day_number) {
    return parseInt(this['start_hour_' + day_number]);
  }
  
  this.getEndHour = function(day_number) {
    return parseInt(this['end_hour_' + day_number]);
  }
  
  this.printPrefs = function() {
    debug('-- Prefs --');
    debug('  Autoresponder: ' + this.autoresponderOn());
    debug('  Error Notifications: ' + this.emailNotificationsOn());
    debug('  Debugging: ' + this.debuggingOn());
    debug('  Top level Name: ' + this.getLabelName());
    debug('  TimeZone: ' + this.getTimeZone());
    for (var i=0; i<=6; i++) {
      debug('  Start hour ' + i + ': ' + this.getStartHour(i));
      debug('  End hour ' + i + ': ' + this.getEndHour(i));
    }
    debug('------------');
  }
}

function getUserPrefs(force_reload) {
  if(USER_PREFS == null || force_reload) {
    debug('User preferences object empty.. reloading..');
    USER_PREFS = new Prefs();
  }
  return USER_PREFS;
}

function savePrefsFromForm(form_object) {
  debug('Saving preferences from form object which contains: ');
  
  for (var prop in form_object)
    debug(' - ' + prop + ' => ' + form_object[prop]);
  
  serviceSaveProperties(form_object, true);
  
  var prefs = getUserPrefs(true);
  
  debug('Refreshed preference object now contains:');
  prefs.printPrefs();
  
  var message = 'Saved new preferences.';
  
  deleteTriggerIfSet(TRIGGER_FUNCTION);
  setupTrigger(TRIGGER_FUNCTION, TRIGGER_MINUTE_TIMER);
  
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
