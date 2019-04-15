# Game of Dirty Answers
Game of Dirty Answers is a browser based cross of Game of Things by the company Quinn &amp; Sherry Inc. and Cards Against Humanity by the company Cards Against Humanity LLC.

# Why?
Game of Dirty Answers exists because I wanted a game like CAH that I could play online with friends. Then I thought, how fun would it be if my friends could write their own dirty answers! The result? GODA.

# How can I use this?
At the moment this program only supports one game per server instance. You can run your own server using Node.js, further instruction below. The questions this game asks are all found in a questions.json file on the root of the files. If you know how to edit JSON files and want to add your own questions you can. If you decide to use this game for any purpose please provide a link back to this GitHub. Thank you.

# How do I run my own server?
You can download Node.js from [https://nodejs.org](https://nodejs.org). After downloading and installing Node.js either clone this repository or download the zip and navigate to the folder in which app.js is located. Delete the folder called "node_modules" and then open a PowerShell, Terminal, or CMD window in that folder. Then type "npm install package.json" followed by pressing enter. After all of the modules install run "node ./app.js". The game server should now be up and running. Press control + C in the console at any time to stop the server. You should now be able to connect to the server on port 80 as long as your firewall is not blocking the connection.

# What's coming in the future?
- Multiple games per server instance
- Cleaner UI
- Web based admin console

If you have other email suggestions email me: [hickorysmokedbacon.yt@gmail.com](mailto:hickorysmokedbacon.yt@gmail.com).
I am not great at CSS, so if anyone who stumbles upon this repo would like to help with making the game interface prettier please email me at the email above. This is an open source project so there will be no payment, but I will add you to a list of people who helped make this possible.

# Admin Console? What does that mean?
The future Admin Console will include the following features:
- View a list of games currently in progress
- Restart or Stop the server
- End a game
- Change a users score
- Whitelist or Blacklist IP addresses
- Blacklist usernames
- View of people's responses
- Edit the list of questions
- Disable certain game features
- Schedule server restarts

All of these features will take time. None of these features will be blocked by a paywall. Every piece of this game will be open source, and it will always remain that way.
However if you would like to donate to me you can PayPal me at the email: hickorysb@brainfart.club
All donations are final unless it is a major mistake, if you donate way too much by mistake please immediately email me so I know that I don't have that money to spend.
All donators will have a chance to be added to a list of donors.

# Donors
None yet. Be the first!
