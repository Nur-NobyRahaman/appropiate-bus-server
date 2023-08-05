const express = require("express");
const app = express();
const port = 5000;
var cors = require("cors");
const ObjectId = require('mongodb').ObjectId;
const stripe = require('stripe')("sk_test_51NbcPSAyUC0FH7xaUwoaqO14ULW25nYUTWHV7RHYRrRDMg6ThTIgExKacvRGbyQWWti2duBNPsbK2giQ5k2Q8Mnp00h6EsquPx");

//use middleware

//user : dbuser1
// password :  NOt0yWt2YCc1o5P3

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://dbuser1:NOt0yWt2YCc1o5P3@cluster0.1i52j3d.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function run() {
  try {
    const database = client.db("foodExpress");
    const userCollection = database.collection("user");

    // get user
    app.get("/user", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const user = await cursor.toArray();
      res.send(user);
    });

    // create a document to insert
    app.post("/user", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      console.log("new user", newUser);
      res.send(result);
    });
    console.log("monde add");


  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

async function placeName() {
  try {
    const database = client.db("searchBus");
    const placeCollection = database.collection("placeName");
    // create an array of documents to insert

    app.get("/placeName", async (req, res) => {
      const query = {};
      const cursor = placeCollection.find(query);
      const placeName = await cursor.toArray();
      res.send(placeName);
    });


    app.post('/adminPlaceName', async (req, res) => {
      const name = req.body
      const result = await placeCollection.insertOne(name)
      console.log(name)
      res.send({ status: "Destination Route Add", result });

    })

    app.post('/create-payment-intent', async (req, res) => {
      const service = req.body;
      const price = service.price;
      console.log(price);
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount:amount,
        currency: "usd",
        payment_method_types: ["card"]
      });
      res.send({ clientSecret: paymentIntent.client_secret })

    })


  } finally {
    // await client.close();
  }
}
placeName().catch(console.dir);

async function busName() {
  try {
    const database = client.db("searchBus");
    const placeCollection = database.collection("busName");
    // create an array of documents to insert
    // get all data 
    app.get("/busName", async (req, res) => {
      const query = {};
      const cursor = placeCollection.find(query);
      const busName = await cursor.toArray();
      console.log(busName);
      res.send(busName);
    });
    // get single data 
    app.get("/busName/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await placeCollection.findOne(query);
      console.log(id);
      console.log(result);
      if (result) {
        res.send({ status: "fined", result });
      }
      else {
        res.send({ status: "Not found" });
      }

    });
    // post 
    app.post('/adminBusList', async (req, res) => {
      const name = req.body
      const result = await placeCollection.insertOne(name)
      console.log(name)
      res.send({ status: "Bus Added", result });

    })

    // put 
    app.put('/busNamePut/:id', async (req, res) => {
      const id = req.params.id;
      const updatedValue = req.body
      const filter = { _id: new ObjectId(id) }
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedValue?.name,
          type: updatedValue?.type,
          roadName: updatedValue?.roadName
        }

      }
      console.log(updatedValue)
      console.log(id)

      const result = await placeCollection.updateOne(filter, updatedDoc, option);
      res.send({ status: "Updated", result })
    })

    // delete
    app.delete('/busName/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      console.log(id)
      const result = await placeCollection.deleteOne(query);
      if (result?.deletedCount > 0) {
        res.send({ status: "deleted bus", result })
      }
      else {
        res.send({ status: "Not delete" })
      }

    })
  } finally {
    // await client.close();
  }
}
busName().catch(console.dir);

async function register() {
  try {
    const database = client.db("searchBus");
    const userCollection = database.collection("userInfo");
    // create an array of documents to insert

    app.post("/register", async (req, res) => {
      const newUser = req.body;
      const email = newUser.email;
      const query = { email };
      const oldUser = await userCollection.findOne(query);
      if (oldUser) {
        res.send({ result: "user already added" });
        console.log({ result: "user already added" });
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
        console.log("user  added", result);
      }

      // console.log("new user", newUser);
      // console.log("oldUser", oldUser);
      // res.send(result);
    });


  } finally {
    // await client.close();
  }
}
register().catch(console.dir);

async function userRegister() {
  try {
    const database = client.db("searchBus");
    const userCollection = database.collection("userRegister");
    // create an array of documents to insert

    app.post("/userRegister", async (req, res) => {
      const newUser = req.body;
      console.log("new user", newUser);
      const result = await userCollection.insertOne(newUser);
      res.send({ status: "userRegister", result });
    });
  } finally {
    // await client.close();
  }
}
userRegister().catch(console.dir);

async function login() {
  try {
    const database = client.db("searchBus");
    const userCollection = database.collection("userInfo");
    // create an array of documents to insert

    app.post("/login", async (req, res) => {
      const { email, password, loginRole } = req.body;

      const registeredUser = await userCollection.findOne({ email });
      if (registeredUser) {
        if (registeredUser.password === password) {
          res.send({ status: "login", user: registeredUser });
        }
        else {
          res.send({ status: "wrong password" });
        }
      } else {
        res.send({ status: "User not Registered" });
      }


    });


    app.get("/getadmin", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const result = await cursor.toArray();

      res.send({ status: "receavied", result });
    });
  } finally {
    // await client.close();
  }
}
login().catch(console.dir);

async function niralaTicket() {
  try {
    const database = client.db("searchBus");
    const niralaBusCollection = database.collection("niralaTicket");

    app.get("/niralaticket", async (req, res) => {
      const query = {};
      const cursor = niralaBusCollection.find(query);
      const result = await cursor.toArray();

      res.send({ status: "receavied", result });
    });
    // create an array of documents to insert


  } finally {
    // await client.close();
  }
}
niralaTicket().catch(console.dir);

async function soneyTicket() {
  try {
    const database = client.db("searchBus");
    const niralaBusCollection = database.collection("soneyTicket");

    app.get("/soneyTicket", async (req, res) => {
      const query = {};
      const cursor = niralaBusCollection.find(query);
      const result = await cursor.toArray();

      res.send({ status: "receavied", result });
    });
    // create an array of documents to insert


  } finally {
    // await client.close();
  }
}
soneyTicket().catch(console.dir);

async function sokalSondhaTicket() {
  try {
    const database = client.db("searchBus");
    const niralaBusCollection = database.collection("sokalSondhaTicket");

    app.get("/sokalSondhaTicket", async (req, res) => {
      const query = {};
      const cursor = niralaBusCollection.find(query);
      const result = await cursor.toArray();

      res.send({ status: "receavied", result });
    });
    // create an array of documents to insert


  } finally {
    // await client.close();
  }
}
sokalSondhaTicket().catch(console.dir);










async function addHome() {
  try {
    const database = client.db("searchBus");
    const addHomeCollection = database.collection("addHome");

    // create an array of documents to insert

    app.post("/addHome", async (req, res) => {
      const homeDetails = req.body
      console.log(homeDetails);
      const result = await addHomeCollection.insertOne(homeDetails);
      res.send({ status: 'Added home details ', result })

    });

    app.get("/addHome", async (req, res) => {
      const query = {};
      const cursor = addHomeCollection.find(query);
      const result = await cursor.toArray();

      res.send({ status: "receavied ", result });
    });

    // Put
    app.put('/addHome/:id', async (req, res) => {
      const id = req.params.id;
      const updatedValue = req.body
      const filter = { _id: new ObjectId(id) }
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          title: updatedValue?.title,
          description: updatedValue?.description,
          photoURL: updatedValue?.photoURL
        }

      }
      console.log(updatedValue)
      console.log(id)
      const result = await addHomeCollection.updateOne(filter, updatedDoc, option);
      res.send({ status: "Updated", result })
    })
    // delete
    app.delete('/addHome/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      console.log(id)
      const result = await addHomeCollection.deleteOne(query);
      res.send({ status: "deleted nirala bus", result })
    })

  } finally {
    // await client.close();
  }
}
addHome().catch(console.dir);


async function niralaBus() {
  try {
    const database = client.db("searchBus");
    const niralaBusCollection = database.collection("niralaBus");

    // create an array of documents to insert

    app.post("/niralaBus", async (req, res) => {
      const seatNumber = req.body
      console.log(seatNumber);
      const result = await niralaBusCollection.insertOne(seatNumber);
      res.send({ status: 'added nirala bus', result })

    });

    app.get("/niralaBus", async (req, res) => {
      const query = {};
      const cursor = niralaBusCollection.find(query);
      const result = await cursor.toArray();

      res.send({ status: "receavied nirala bus", result });
    });

    // delete
    app.delete('/niralaBus/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      console.log(id)
      const result = await niralaBusCollection.deleteOne(query);
      res.send({ status: "deleted nirala bus", result })
    })
  } finally {
    // await client.close();
  }
}
niralaBus().catch(console.dir);

async function sokalSondhaBus() {
  try {
    const database = client.db("searchBus");
    const niralaBusCollection = database.collection("sokalSondhaBus");

    // create an array of documents to insert

    app.post("/sokalSondhaBus", async (req, res) => {
      const seatNumber = req.body
      console.log(seatNumber);
      const result = await niralaBusCollection.insertOne(seatNumber);
      res.send({ status: 'added sokalSondha Bus', result })

    });


    app.get("/sokalSondhaBus", async (req, res) => {
      const query = {};
      const cursor = niralaBusCollection.find(query);
      const result = await cursor.toArray();

      res.send({ status: "receavied sokalSondhaBus Bus", result });
    });

    // delete
    app.delete('/sokalSondhaBus/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      console.log(id)
      const result = await niralaBusCollection.deleteOne(query);
      res.send({ status: "deleted nirala bus", result })
    })

  } finally {
    // await client.close();
  }
}
sokalSondhaBus().catch(console.dir);


async function soneyBus() {
  try {
    const database = client.db("searchBus");
    const niralaBusCollection = database.collection("soneyBus");

    // create an array of documents to insert

    app.post("/soneyBus", async (req, res) => {
      const seatNumber = req.body
      console.log(seatNumber);
      const result = await niralaBusCollection.insertOne(seatNumber);
      res.send({ status: 'added soney Bus', result })
    });


    app.get("/soneyBus", async (req, res) => {
      const query = {};
      const cursor = niralaBusCollection.find(query);
      const result = await cursor.toArray();

      res.send({ status: "receavied soney Bus", result });
    });
    // delete


  } finally {
    // await client.close();
  }
}
soneyBus().catch(console.dir);

async function busBookingDetails() {
  try {
    const database = client.db("searchBus");
    const busBookingDetailsCollection = database.collection("busBookingDetails");

    // create an array of documents to insert

    app.post("/busBookingDetails", async (req, res) => {
      const bookingDetails = req.body
      console.log(bookingDetails);
      const result = await busBookingDetailsCollection.insertOne(bookingDetails);
      res.send({ status: 'added soney Bus', result })
    });


    app.get("/busBookingDetails", async (req, res) => {
      const query = {};
      const cursor = busBookingDetailsCollection.find(query);
      const result = await cursor.toArray();

      res.send({ status: "receavied  Bus", result });
    });

    // find one 

    // app.get("/busBookingDetails/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const result = await busBookingDetailsCollection.findOne(query);
    //   console.log(id);
    //   console.log(result);
    //   if (result) {
    //     res.send({ status: "fined", result });
    //   }
    //   else {
    //     res.send({ status: "Not found" });
    //   }

    // });


    // // delete
    // app.delete('/busBookingDetails/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   console.log(id)
    //   const result = await busBookingDetailsCollection.deleteOne(query);
    //   res.send({ status: "deleted ", result })
    // })

  } finally {
    // await client.close();
  }
}
busBookingDetails().catch(console.dir);


async function ticketNotification() {
  try {
    const database = client.db("searchBus");
    const ticketNotificationCollection = database.collection("ticketNotification");

    // create an array of documents to insert

    app.post("/ticketNotification", async (req, res) => {
      const seatNumber = req.body
      console.log(seatNumber);
      const result = await ticketNotificationCollection.insertOne(seatNumber);
      res.send({ status: 'added soney Bus', result })
    });


    app.get("/ticketNotification", async (req, res) => {
      const query = {};
      const cursor = ticketNotificationCollection.find(query);
      const result = await cursor.toArray();

      res.send({ status: "receavied soney Bus", result });
    });
    // delete
    app.delete('/ticketNotification/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      console.log(id)
      const result = await ticketNotificationCollection.deleteOne(query);
      res.send({ status: "deleted ", result })
    })

  } finally {
    // await client.close();
  }
}
ticketNotification().catch(console.dir);

async function addServices() {
  try {
    const database = client.db("searchBus");
    const addServicesCollection = database.collection("addServices");

    // create an array of documents to insert

    app.post("/addServices", async (req, res) => {
      const busDetails = req.body
      console.log(busDetails);
      const result = await addServicesCollection.insertOne(busDetails);
      res.send({ status: `Added ${busDetails?.name} Bus`, result })
    });

    //get 

    app.get("/addServices", async (req, res) => {
      const query = {};
      const cursor = addServicesCollection.find(query);
      const result = await cursor.toArray();

      res.send({ status: "receavied  Bus", result });
    });

    // put 
    app.put('/addServices/:id', async (req, res) => {
      const id = req.params.id;
      const updatedValue = req.body
      const filter = { _id: new ObjectId(id) }
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedValue.name,
          type: updatedValue.type,
          origin: updatedValue.origin,
          destination: updatedValue.destination,
          start: updatedValue.start,
          end: updatedValue.end,
          price: updatedValue.price,
          allTimeSchedule: updatedValue.allTimeSchedule
        }

      }
      console.log(updatedValue)
      console.log(id)
      const result = await addServicesCollection.updateOne(filter, updatedDoc, option);
      res.send({ status: "Updated", result })
    })

    // delete
    app.delete('/addServices/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      console.log(id)
      const result = await addServicesCollection.deleteOne(query);
      res.send({ status: "deleted ", result })
    })

  } finally {
    // await client.close();
  }
}
addServices().catch(console.dir);





app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
