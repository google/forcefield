#!/usr/bin/env python

# Copyright 2014 Google Inc. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Run the script with path to the JSON file you downloaded from Google Drive.
# eg. unpack_exported_script.py ~/Downloads/Forcefield.json
#
# Script will unpack JSON and write it to the src directory.
import json
import os
import sys

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
  if f_dict['type'] == 'html':
    file_name += '.html'
  elif f_dict['type'] == 'server_js':
    file_name += '.gs'
  else:
    raise Exception('unknown file type: %s' % f_dict['type'])
  file_contents = f_dict['source']

  print '-- Processing %s --' % file_name

  with open(os.path.join('src',file_name), 'w') as f:
    f.write(file_contents.encode('utf-8'))

  print '  Finished'

