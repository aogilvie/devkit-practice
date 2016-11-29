# About

This is a practice project for learning devkit. The idea was to create a typical 'gem swapper' style game within a reasonable amount of time. All in all about 12-15 hours were spent on this project.

### Goals

These were priority Goals (assumes the use of devkit framework):

- Create multiple screens with some sort of flow [achieved]
- Create basic game logic with following sub features:
  - Can click or drag to swap gems [achieved]
  - Gems that make up a cluster (greater than 3 in a row) give points [achieved]
  - Gems that have been clustered disappear and are filled by vertically sliding down gems [achieved]
- Implement game end login (timer, limited moves or some such) [partial - moves calculation was added]


These were additional goals I set to help achieve more knowledge about how devkit works:

- Implement a devkit plugin [achieved]
- Practice a sample deployment (package a release) [achieved]

... And some basics that I believe should just be part of due process:

- Codebase should lint [achieved]
- Document building the application [achieved]


### Strategy

(devkit development, flow and game logic)

I started off building my environment and reading the devkit documentation. I was also interested to know it works under the hood in more detail (given I used to program Ejecta/Eject-X and such) but with the time limitation I focused mainly on the `ui.x` APIs. It would be important to get the views configured and since I found the `this.render(ctx)` method, I decided to do the heavy lifting in pure JS (because that would be quicker for me).

I took a simple flow and `ViewStack` strategy from the molehill tutorial. This just involves pre-loading some views and pushing into the root view when you want to display a specific "screen".

I took bits and pieces of game logic from various open source MIT examples, the final code logic was almost a complete re-write however. The code logic I must admit is working, although, far from the standard I would like. I tried to write modular-ish code but the timelimit requirement meant I had to often hack some dependencies to classes where I did not want. Given a proper timeline, the code deserves a good refactoring.

I also added a custom linter to parse the globals that come with devkit, that took some time off overall development. But probably saved me lots of debugging bug time.

(devkit plugins)

As a middleware developer for a long time, I wanted to experiment with the plugin architecture. I was interested to see how quick I could add Facebook authentication for example. Unfortunately this was not a great experience. Many plugins I found were out of date or used broken/deprecated code (`GLOBAL.apiName` for example). Worse still, after writing my own plugin example I found that installing a plugin can ONLY be done from Github `devkit install <url>` and not a local path.

(devkit release)

I wanted to also practice a release to see how devkit packages the application. For this I quickly created a dockerfile that boots nginx and serves the application. I think this would be of most benefit with continuous integration to the codebase, but for now I wanted to see that my application could be built in a release state.

### Bugs

Although the logic is working there are some UI bugs which happened once I added subviews;

- When using the devkit Input events in subviews, `the point.y` event data is wrong by `~-20px` [no current solution]
- When gem swapping the animation is blacked out [not finished with modifying code when I applied gem images]

# Next Steps

I thought developing with devkit was quite interesting. It uses by default a 2D canvas. For some future experimentation I'd like to try some of the following:

- I have experience with Three.js so i'd like to try creating a web-gl canvas and importing three.js
- Multiple canvas buffers. I read some documentation for doing this and seems this is very possible (of course, this is key to canvas development - common practice with rpgs and tilemappers). I did not get a chance to try it with this project.
- Expanding my plugin and creating new plugins to store data async remotely.
