const express = require('express');
const cors = require('cors');
require('dotenv').config()
// const admin = require('./admin');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2vxppji.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeesCollection = client.db('coffeeDB').collection('coffees');
    const contactsCollection = client.db('coffeeDB').collection('contacts');
    const usersCollection = client.db('coffeeDB').collection('users');

    // Create a contact
    app.post('/contact', async (req, res) => {
      const contactData = req.body; // expects name, email, message
      console.log(contactData);
      const result = await contactsCollection.insertOne(contactData);
      res.send(result);
    });
    // Get all contacts
    app.get('/contact', async (req, res) => {
      const result = await contactsCollection.find().toArray();
      res.send(result);
    });
    // Get a single contact
    app.get('/contact/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const contact = await contactsCollection.findOne(query);
      res.send(contact);
    })
    //delete a contact
    app.delete('/contact/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await contactsCollection.deleteOne(query);
      res.send(result);
    })

    // user related api start

    //Get all users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })
    //create a user
    app.post('/users', async (req, res) => {
      const userData = req.body; // expects name, email, message
      const result = await usersCollection.insertOne(userData);
      res.send(result);
    });

    //update a user
    app.patch('/users', async(req, res)=>{
      const {email, lastSignInTime} = req.body;
      const filter = {email: email}
      const updatedDoc = {
        $set: {
          lastSignInTime: lastSignInTime
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    //delete a user
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })

    //delete user from firebase
    // Admin API to delete Firebase Auth user by UID
    // app.delete('/admin/delete-firebase-user/:uid', async (req, res) => {
    //   const uid = req.params.uid;

    //   try {
    //     await admin.auth().deleteUser(uid);
    //     res.send({ success: true, message: `User with UID ${uid} deleted from Firebase.` });
    //   } catch (error) {
    //      console.error('❌ Error deleting Firebase user:', error);
    //     console.error('Error deleting Firebase user:', error);
    //     res.status(500).send({ success: false, error: error.message });
    //   }
    // });

    /////////////////////////
//     app.get('/test-user/:uid', async (req, res) => {
//   try {
//     const userRecord = await admin.auth().getUser(req.params.uid);
//     res.send({ found: true, uid: userRecord.uid });
//   } catch (error) {
//     res.status(404).send({ found: false, error: error.message });
//   }
// });

    ////////////////////////



    // Get all coffees
    app.get('/coffees', async (req, res) => {
      const result = await coffeesCollection.find().toArray();
      res.send(result);
    })

    // Get a single coffee
    app.get('/coffees/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const coffee = await coffeesCollection.findOne(query);
      res.send(coffee);
    })

    app.post('/coffees', async (req, res) => {
      const newCoffee = req.body;
      console.log(newCoffee);
      const result = await coffeesCollection.insertOne(newCoffee);
      res.send(result);
    })

    //update a coffee
    app.put('/coffees/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true }; // Create new if doesn't exist
      const updatedCoffee = req.body;
      const updateDoc = {
        $set: updatedCoffee
      }
      const result = await coffeesCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    //delete a coffee
    app.delete('/coffees/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeesCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Coffee is Cooking!');
})


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});