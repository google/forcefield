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
 Trigger stuff
**********************/
function findTrigger(nameOfFunction) {
  var triggers =  serviceGetTriggers();
  for(i=0; i<triggers.length; i++)
    if(triggers[i].getHandlerFunction() == nameOfFunction)
      return triggers[i];
  return null;
}

function isTriggerAlreadySet(nameOfFunction) {
  return findTrigger(nameOfFunction) != null;
}

function deleteTriggerIfSet(functionName) {
  isTriggerAlreadySet(functionName) && serviceDeleteTrigger(functionName);
}

function removeTrigger(functionName) {
  if(isTriggerAlreadySet(functionName))
    serviceDeleteTrigger(functionName);
}

function setupTrigger(functionName, minutes) {
  debug('Setting up trigger for function:' + functionName + ' minutes: ' + minutes);
  if(!isTriggerAlreadySet(functionName)) {
    debug('Trigger has not already been set for function:' + functionName + '. Setting now to every: ' + minutes + ' minutes');
    serviceCreateTrigger(functionName, minutes);
  }
  else
    debug("Trigger is already set for function:"+functionName);
}
