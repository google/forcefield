#!/usr/bin/python
#
# Run the script with path to the JSON file you downloaded from google.drive.
# eg. checkin.py ~/Downloads/GmailDelaySendWeb.json
#
# Script will unpack JSON and edit/updates files in git for you.
#
# REMEMBER: You still need to commit & push
import json
import os
import sys
from subprocess import call

def Usage(msg=None):
  if msg:
    print msg
  print 'Usage: %s <path_to_json_file>' % os.path.basename(sys.argv[0])
  sys.exit(1)

if len(sys.argv) < 2:
  Usage('Must supply path to JSON file.')

json_path = sys.argv[1]

if not os.path.isfile(json_path):
  Usage('Expected to find file at: %s' % json_path)

with open(json_path) as f:
  json_objects = json.loads(f.read())

print 'Found %d files in JSON' % len(json_objects['files'])

files = json_objects['files']

for f_dict in files:
  file_name = f_dict['name']
  file_contents = f_dict['source']

  print '-- Processing %s --' % file_name

  with open(os.path.join('src',file_name), 'w') as f:
    f.write(file_contents.encode('utf-8'))

  print '  Finished'

call(['git','add','.'])
print '-- REMEMBER YOU STILL NEED TO COMMIT AND PUSH CHANGES --'
