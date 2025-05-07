// Server.js

// Add required imports 
const express = require('express'); 
const cors = require('cors');   // Allows the server to accept requests from different origins.               
const app = express();  // Defines routes, middleware, handles HTTP requests 
const User = require('./UserSchema');
const Feedback = require('./FeedbackSchema')

app.use(express.json());
app.use(cors());
// Start the express server, listening on port 9000
app.listen(9000, ()=> {
    console.log(`Server Started at ${9000}`)
})

const mongoose = require('mongoose'); // Allows interaction with MongoDB databases

// User JonesyFortnite, using password 88K9pW5K74HfOetY, Cluster0, database Database
const mongoString = "mongodb+srv://JonesyFortnite:88K9pW5K74HfOetY@Cluster0.ywqmf.mongodb.net/Database"
mongoose.connect(mongoString) // Connect to the database
const database = mongoose.connection // Track datatbase information

// Display an error if connection fails
database.on('error', (error) => console.log(error))

// Once connected, notify the user of a connection and show the ready state
database.once('connected', () => console.log('Database Connected'))
database.once('connected', () => console.log(mongoose.connection.readyState))

// API endpoint responsible for creating a new user in the users collection
app.post('/createUser', async (req, res) => {
    console.log(`SERVER: CREATE USER REQ BODY: ${req.body.username}`)
    const un = req.body.username
    const user = new User(req.body);
    try {
        User.exists({username: un}).then(result => {
            if(Object.is(result, null)) {
                const user = new User(req.body);
                user.save()
                console.log(`User created! ${user}`)
                res.send(user)
            }
            else {
                console.log("Username already exists")
                res.status(500).send("Username already exists")
            }
        })
    }
    catch (error){
        res.status(500).send(error)
    }
})

app.post('/sendFeedback', async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        console.log(`Feedback saved: ${JSON.stringify(feedback)}`);
        res.status(200).send(feedback);
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).send(error);
    }
});

// API endpoint responsible for creating a new project in the projects collection
app.post('/createProject', async (req, res) => {
    console.log(`SERVER: CREATE Project REQ BODY: ${req.body.name} ${req.body.team} ${req.body.productOwner} ${req.body.manager}`)
    const pn = req.body.name
    const project = new Project(req.body);
    try {
        Project.exists({projectname: pn}).then(result => {
            if(Object.is(result, null)) {
                const project = new Project(req.body);
                project.save()
                console.log(`Project Created! ${project}`)
                res.send(project)
            }
            else {
                console.log("Project already exists.")
                res.status(500).send("Project already exists")
            }
        })

    }
    catch(error){
        res.status(500).send(error)
    }
})

// API endpoint responsible for looking at existing users based on username and password
app.get('/getUser', async (req, res) => {
    console.log(`SERVER: GET USER REQ BODY: ${req.query}`)
    const username = req.query.username
    const password = req.query.password
    try {
        const user = await User.findOne({ username, password })
        res.send(user)
    }
    catch (error) {
        res.status(500).send(error)
    }
})

app.get('/allFeedbacks', async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.status(200).json(feedbacks);
    } catch (err) {
        res.status(500).send('Error retrieving feedbacks');
    }
});


// API endpoint responsible for looking at existing users
app.get('/getUsers', async (req, res) => {
    console.log(`SERVER: GET ALL USERS`)
    const username = req.query.username
    const password = req.query.password
     try {
        const users = await User.find({});
        res.send(users);
    }
    catch (error) {
        res.status(500).send(error);
    }
})

// API endpoint responsible for looking at existing teams
app.get('/getTeams', async (req, res) => {
    console.log(`SERVER: GET ALL TEAMS`);
    try {
        const teams = await Team.find({});
        res.send(teams);
    }
    catch (error) {
        res.status(500).send(error);
    }
});

// API endpoint responsible for looking at existing projects
app.get('/getProjects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.send(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).send("Error fetching projects");
    }
});