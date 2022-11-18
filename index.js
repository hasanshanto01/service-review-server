const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1d18zed.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {

        const serviceCollection = client.db('serviceReview').collection('services');
        const reviewCollection = client.db('serviceReview').collection('reviews');

        // services api
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);

            const result = await cursor.limit(3).toArray();
            res.send(result);
        });

        // all services api
        app.get('/services/all', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);

            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/services/all', async (req, res) => {
            const service = req.body;

            const result = await serviceCollection.insertOne(service);
            res.send(result);
        });

        // single service api
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;

            const query = {
                _id: ObjectId(id)
            };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        // reviews api

        app.get('/reviews/all', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};

            const cursor = reviewCollection.find(query);
            const reviews = await cursor.skip(page * size).limit(size).toArray();

            const count = await reviewCollection.estimatedDocumentCount();

            res.send({ count, reviews });
        });

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;

            const query = {
                serviceId: id
            };
            const cursor = reviewCollection.find(query);

            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/reviews', async (req, res) => {
            const query = {
                email: req.query.email
            };
            const cursor = reviewCollection.find(query);

            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/reviews', async (req, res) => {
            console.log(req.body);
            const review = req.body;

            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        // review update

        app.get('/reviews/edit/:id', async (req, res) => {
            // console.log(req.params.id);

            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            };

            const review = await reviewCollection.findOne(query);
            res.send(review);
        });

        app.put('/reviews/edit/:id', async (req, res) => {
            const id = req.params.id;

            const query = {
                _id: ObjectId(id)
            };

            const updatedDoc = {
                $set: {
                    message: req.body.message
                }
            };
            console.log(id, updatedDoc);
            const result = await reviewCollection.updateOne(query, updatedDoc);
            res.send(result);
        });

        // review delete
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;

            const query = {
                _id: ObjectId(id)
            };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });

    }
    finally {

    }

}

run().catch(error => console.error(error));


app.get('/', (req, res) => {
    res.send('service review server running.....')
});

app.listen(port, () => {
    console.log('service review server running on port:', port);
});