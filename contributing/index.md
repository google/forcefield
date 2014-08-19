---
layout: default
---

## Contributing

Forcefield is [developed on GitHub](https://github.com/google/forcefield). We welcome pull requests and bugs filed there.

### Getting set up

Apps Script is a bit tricky to integrate with source control, since scripts typically live in Google Drive and nowhere else. However, the Google Plugin for Eclipse [allows syncing](https://developers.google.com/eclipse/docs/apps_script) files in an Apps Script project on Drive with files on your local filesystem.

Of course, you can always work with your files using git like normal, but if you want to run your modified version of the script and test it out on Apps Script, here are the steps you'll want to follow:

1. Create a blank project in [Apps Script](https://script.google.com) and give it a name.
1. Install [Eclipse](http://www.eclipse.org/downloads/).
1. Install the [Google Plugin for Eclipse](https://developers.google.com/eclipse/docs/download).
1. Follow the instructions for [using the Google Plugin for Eclipse with an Apps Script project](https://developers.google.com/eclipse/docs/apps_script).
1. Clone [the Forcefield repository](https://github.com/google/forcefield), if you haven't already done so.
1. Go to the directory that Eclipse created for your blank Apps Script project, and create symlinks to each of the files in the Forcefield repository clone. (A quick way to do this is to run `ln -s /path/to/your/repo/script/* ./` from within the directory Eclipse created, making sure to specify the `script/` subdirectory inside wherever you cloned the repository.)

If you refresh your Eclipse project, you should see all the Forcefield files show up, and if you refresh your browser they should likewise show up in your previously-empty Apps Script project.

Now changes you make in Eclipse will get synced to the copy of your Apps Script project online as well as to your local clone of the Forcefield repository.
