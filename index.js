const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

//Create the mongo client to use
const client = new MongoClient(process.env.MONGO_URL);

const app = express();
const port = process.env.PORT // 1337;

app.use(express.static('public'));
app.use(bodyParser.json());


//Root route
app.get('/', (req, res) => {
    res.status(300).redirect('/info.html');
});

// Return all challenges from the database
app.get('/challenges', async (req, res) =>{

    try{
        //connect to the db
        await client.connect();

        //retrieve the challenges collection data
        const colli = client.db('Challenge').collection('challenges');
        const chs = await colli.find({}).toArray();

        //Send back the data with the response
        res.status(200).send(chs);
    }catch(error){
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

// /challenges/:id
app.get('/challenges/:id', async (req,res) => {
    //id is located in the query: req.params.id
    try{
        //connect to the db
        await client.connect();

        //retrieve the challenge collection data
        const colli = client.db('Challenge').collection('challenges');

        //only look for a challenge with this ID
        const query = { _id: ObjectId(req.params.id) };

        const challenge = await colli.findOne(query);

        if(challenge){
            //Send back the file
            res.status(200).send(challenge);
            return;
        }else{
            res.status(400).send('Challenge could not be found with id: ' + req.params.id);
        }
      
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

// save a challenge
app.post('/challenges', async (req, res) => {

    if(!req.body.name || !req.body.points || !req.body.course){
        res.status(400).send('Bad request: missing name, points or course');
        return;
    }

    try{
        //connect to the db
        await client.connect();

        //retrieve the challenge collection data
        const colli = client.db('Challenge').collection('challenges');

        // Validation for double challenges
        const challenge = await colli.findOne({name: req.body.name, points: req.body.points, course: req.body.course});
        if(challenge){
            res.status(400).send('Bad request: challenge already exists with ' + 'name ' + req.body.name + 'points ' + req.body.points + 'cousre ' + req.body.course);
            return;
        } 
        // Create the new challenge object
        let newChallenge = {
            name: req.body.name,
            points: req.body.points,
            course: req.body.course
        }
        
        // Insert into the database
        let insertResult = await colli.insertOne(newChallenge);

        //Send back successmessage
        res.status(201).json(newChallenge);
        return;
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

// delete challenge
app.delete('/challenges/:id', async (req,res) => {
    //id is located in the query: req.params.id
    try{
        //connect to the db
        await client.connect();

        //retrieve the challenge collection data
        const colli = client.db('Challenge').collection('challenges');

        //only look for a challenge with this ID
        const query = { _id: ObjectId(req.params.id) };

        const challenge = await colli.removeById(query);

        if(challenge){
            //Send back the file
            res.status(200).send(challenge);
            return;
        }else{
            res.status(400).send('err');
        }
      
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});



app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
})