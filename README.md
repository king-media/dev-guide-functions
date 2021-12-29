# Dev Guide Functions Edition

This repo holds all code in the (Dev Guide Playlist)[https://www.youtube.com/playlist?list=PLRq7FfI6aZt4QpOy-8ccgEy2lPmRrjwKZ] that relates to functions. I will outline clear instructions on how to execute code in the browser and within Node.

## Requirements

- (Node.js)[https://nodejs.org/]
- (Chrome)[https://www.google.com/chrome/]: All html files will have an execution script that automatically runs in Chrome. If you wish to open html files in a different browser you must manually open the html file within your file system.

## Folder Outline

- /dist: Holds the transpiled files that will be served/run within the Node environment.
- /lessons: All JavaScript files divided by lessons. The files will be named based on the corresponding video topic (i.e. [video-topic].js). For example, lesson 1 was on "Base Functions" so the corresponding JavaScript file will be _base-functions.js_.
- /server: The server code that returns the root html file and its assets.

## Instructions

- Fork or Clone the repo and navigate to the root project directory.
- Run _npm install_

The lessons are split between a visual representation that is ran within the browser or within Node. Here are the steps to execute the JS lesson files within either environment:
**see package.json for scripts**

### Node ENV

1. run the _execute_ npm script. The script takes a "file" argument.

- npm run execute --file=[lesson-file]
  Ex: npm run execute --file=base-functions

### Chrome ENV

1. run the _serve_ npm script.

- npm run serve

The server will run on localhost:8080
