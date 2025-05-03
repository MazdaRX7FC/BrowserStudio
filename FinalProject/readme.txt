ensure that Node.js and npm are already installed on your machine

add "Final Project" from "source_code" folder to a directory that can be accessed via PowerShell

cd to Final Project in console

cd to FinalProject/client in console

install dependencies (on client and server):
-> npm install (for node modules)
-> npm install axios
-> npm install react-router-dom
-> npm install bootstrap

Client only:
-> npm install react-dnd react-dnd-html5-backend
-> npm install tone
-> npm install howler // nothing in the project relies on howler anymore, but if issues arise idk try it

now cd to FinalProject/server in console

install dependencies (server only):
-> npm init -y
-> npm install mongodb
-> npm install express
-> npm install cors
-> npm install dotenv
-> npm install mongoose

NOTE: only dependencies used were those listed in the document for assignment 2. If it still doesn't work after
installing all of the above, try installing ones I haven't mentioned. I believe these are the
only ones I've used.

After installing dependencies, open two instances of PowerShell (either in VS code or on Windows)

in first instance -
cd to FinalProject/server again.
call "npm start" or "node server.js" to start the server and connect to the database.

> should say 
Server Started at 9000
Database Connected
1

In second instance -
cd to FinalProject/client again.
call "npm start" to start the application

> should
Open up to the login page. 
If you want to login quickly without creating an account, enter 'a' into password and username fields and submit.
