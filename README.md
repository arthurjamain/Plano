# Plano

Test project.

`npm install` to install dependencies

Needs a running instance of mongodb (`mongod`) on its default port.
Runs on port 443 by default (https).

Can : 

- Register a new user (email / password)
- Log in / Log out
- Sessions are stored using mongodb
- Sessions are built on httpOnly cookies
- No multiple sessions
- One account per mail
- One session per account

Most of the server code is in the src/SessionManager. The rest is in server.js

The client code is 100% in main.js. I didn't go too far with backbone as it didn't seem really necessary.

Notable libs :

- mongoose
- bcrypt
- ejs
