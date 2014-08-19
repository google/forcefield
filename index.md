---
layout: default
---

### Leave work at work.

Forcefield is an add-on for Gmail that helps you stop checking your work email when you go home. Outside of work hours, any email you receive will stay out of your inbox. Your phone won't buzz, and your unread count won't go up.

When work hours start again, all of the accumulated mail will get delivered to your inbox.

The result? You can stop feeling pressure to respond to late-night work emails.

### How it works

Forcefield uses [Google Apps Script](https://developers.google.com/apps-script/). Apps Script lets developers write scripts that run right on Google's servers and interact with Google products, like Gmail.

When you start using Forcefield, you install a filter in Gmail that moves all of your incoming mail to a folder in Gmail and marks it read. Forcefield checks for new mail once a minute, and if it's during business hours, it moves the mail back to your inbox and marks it unread.

### Setting up Forcefield

There are two parts to Forcefield: the script itself, and a filter for Gmail.

#### Configuring the Forcefield script

1. Go to [the Forcefield preferences page](https://script.google.com/macros/s/AKfycbyuR18yqYaULKcSN8dV0D77OLW24KzHBjZIqENeSMjb-PAGmYE/exec).
1. You will see a message saying "This app needs authorization to run." Click "Continue."
1. Read through the list of permissions and click "Accept" if you agree with them. (If you have questions about the permissions Forcefield needs, see [the FAQ](/forcefield/faq/).)
1. Choose the hours you want to receive mail, and click "Save Preferences" at the bottom. (This is very important: if you don't click "Save Preferences," the script won't finish installing!)

#### Setting up the filter

1. Right click on [this link](https://raw.githubusercontent.com/google/forcefield/master/ForcefieldFilter.xml) and choose "Save link as" to save the page.
1. In Gmail, go to Settings -> Filters, scroll to the bottom, and click "Import filters."
1. Click "Choose File" and choose the file you just downloaded (ForcefieldFilter.xml).
1. Click "Open file."
1. Click "Create filters," and the filter will be installed.

Note: if you're a power user and set up your own filters, you'll want to make sure that this filter stays at the bottom of your filter list. Otherwise, it could interfere with other filters that come later (particularly other ones that delete messages or cause them to skip the inbox).

You're all set! If you ever need to cheat, you can peek in your Forcefield folder in Gmail, but that kind of defeats the purpose. (And by the way, any mail you read while it's in Forcefield will still get marked unread again when your work hours start again.)

