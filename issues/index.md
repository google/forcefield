---
layout: default
---

## Known Issues

Below are some known issues; if you encounter an issue that isn't listed below, please let us know via [our forum](https://groups.google.com/forum/#!forum/forcefield-apps-script).

###### When email moves back into your inbox after your work hours resume, it can take several minutes for them all to show up.

This is a result of the Google APIs that Forcefield uses; specifically, the API for marking individual messages unread is fairly slow, and can take several seconds per message. If you have lots of messages, it will take a while to process them all. Don't worry, though, they'll all eventually show up! Unfortunately, there's no solution to this at present.

###### When emails move back into your inbox after your work hours resume, they get marked unread in random order.

If a thread containing several messages gets moved back to your inbox, currently the order that the messages get marked unread is random. This will be fixed soon, so that older messages within a thread get marked unread before later ones.

###### Email messages will be slightly delayed before showing up in your inbox.

Due to the limitations of the APIs exposed in Gmail, Forcefield has to be active all the time. This means that even during work hours, email will temporarily skip your inbox, and then get moved back to your inbox. Since the Forcefield script runs once a minute, the delay could be anywhere from 0 seconds up to a minute.

This isn't something that can be fixed right now, but if Gmail releases an API that allows creating and deleting filters, this could be eliminated.

###### If you read / archive a thread while one or more messages are still waiting in the Forcefield folder, the thread will come back to your inbox.

If even one message in a thread is in the inbox, Gmail will show the whole thread, even if other messages have been archived. This means that if you're reading a thread and another message comes in, Gmail will show that message too, even though it's in Forcefield. Then, when Forcefield runs, the message will get marked unread, and the whole thread will move back to your inbox.

The solution to this one is the same as the delay: if Gmail releases an API that allows filters to be created and deleted by a script, then Forcefield wouldn't have to be active all the time; instead, it could only kick in during off-work hours.
