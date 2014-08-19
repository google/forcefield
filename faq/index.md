---
layout: default
---
## Can I run my own copy of Forcefield?

Of course! Just follow the instructions for [setting up your own copy](../own-copy/).


## Why do you need these permissions?

First of all, if you're concerned by the permissions Forcefield needs, you can always [set up your own copy](../own-copy/).

If you're just curious, here's what each permission is used for:

###### View and manage your mail

Forcefield needs this in order to be able to move your mail back to your inbox and mark it unread.

###### Know who you are on Google

This is automatically included when Forcefield asks to view your email address.

###### View your email address

This is used to send you email notifications of any errors, if you enable debugging.

###### Manage your calendars

Forcefield can retrieve your default timezone from Google Calendar, so that it can prefill the timezone to use for your working hours.

###### View and manage data associated with the application

This allows Forcefield to save your preferences, such as the hours to run.

###### Allow this application to run when you are not present

Forcefield needs to run even when you aren't using your computer, so that it can take care of your email as soon as it arrives.

###### Send email as you

Used to send email notifications, if you enable debugging.

###### Connect to an external service

Some functionality that Forcefield needs isn't currently available through the Apps Script APIs, so Forcefield also uses the [Gmail API](https://developers.google.com/gmail/api/) directly. It does this by connecting to the public endpoints just like a generic web service, which is what prompts this warning.
