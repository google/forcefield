/**********************
 GLOBALS
**********************/
var SCRIPT_VERSION = 8.0;

// Top level label name
var TOP_LEVEL_LABEL = 'GmailDelaySend';

// Malformed messages will be placed in this label
var DELAY_SEND_ERROR_LABEL = 'Errors';

// Messages to send will be placed under this label
var DELAY_SEND_TO_SEND_LABEL = 'ToSend';

// Use default google calendar to determine user timezone
var DEFAULT_TIMEZONE = 'default';

// Array of notifications  
var receipts = [];

// Global preferences object
var USER_PREFS = null;

// Sent to user if not empty and 'Error Notifictions' is turned on.
var error_msgs = [];

// Parsing errors are always sent
var parsing_errors = [];

var EXECUTE_COMMAND_LOGGING = false;

// Retry logic
var NUM_RETRIES = 10;

// Text messages are composed with '<br />'
var TEXT_LINE_BREAKS = '<br />';

// In milliseconds
var SLEEP_TIME = 1500;

var SCRIPT_NAME = "GMail Delay Send";

var TRIGGER_FUNCTION="main";
var TRIGGER_MINUTE_TIMER=5;

/* NOTE these names must match the 'name' attribute in HTML */
var DEFAULT_PREFS = {
  bcc: 'false',
  require_label: 'true',
  email_receipts: 'true',
  triggers: 'false',
  debugging: 'false',
  error_notification: 'false',
  delim: '@',
  localzone: 'default',
  trigger_min: '5',
};
