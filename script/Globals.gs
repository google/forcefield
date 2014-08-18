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
 GLOBALS
**********************/
var SCRIPT_VERSION = 0.1;

// Top level label name
var TOP_LEVEL_LABEL = 'Forcefield';

// Use default Google calendar to determine user timezone
var DEFAULT_TIMEZONE = 'default';

// Array of notifications  
var receipts = [];

// Global preferences object
var USER_PREFS = null;

// Sent to user if not empty and 'Error Notifications' is turned on.
var error_msgs = [];

var EXECUTE_COMMAND_LOGGING = false;

// Retry logic
var NUM_RETRIES = 10;

// In milliseconds
var SLEEP_TIME = 1500;

var SCRIPT_NAME = "Forcefield";

var TRIGGER_FUNCTION="main";
var TRIGGER_MINUTE_TIMER=1;

/* NOTE these names must match the 'name' attribute in HTML */
var DEFAULT_PREFS = {
  send_autoresponse: 'false',
  debugging: 'false',
  error_notification: 'false',
  localzone: 'default',
  start_hour_1: 8,
  end_hour_1: 17,
  start_hour_2: 8,
  end_hour_2: 17,
  start_hour_3: 8,
  end_hour_3: 17,
  start_hour_4: 8,
  end_hour_4: 17,
  start_hour_5: 8,
  end_hour_5: 17,
  start_hour_6: 99,
  end_hour_6: 17,
  start_hour_0: 99,
  end_hour_0: 17,
};
