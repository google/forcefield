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
