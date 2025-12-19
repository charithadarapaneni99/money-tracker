const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');
require('dotenv').config();
const Transaction = require('./models/transaction.js');
const app = express();
const PORT = process.env.PORT || 4040;


app.use(cors());

app.use(express.json());

app.get('/api/test', (req, res) => {
    res.json('test ok hey');
} );

app.post("/api/transaction", async (req, res) => {
    // console.log(process.env.MONGO_URL)
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Received:", req.body);
    const {name, description, datetime, price} = req.body;

    const transaction = await Transaction.create({name, description, datetime, price});


    res.json(transaction);
  });


app.get('/api/transactions', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const transactions = await Transaction.find();
    res.json(transactions);
});


app.delete('/api/transaction/:id', async (req, res) => {
    const { id } = req.params;

    await Transaction.findByIdAndDelete(id);
    res.json({success:true});
});

app.put('/api/transaction/:id', async (req, res) => {
    const { id } = req.params;
    const {name, description, datetime, price} = req.body;
    const updatedTransaction = await Transaction.findByIdAndUpdate(
        id,
        {name, description, datetime, price},
        {new:true}
    );

    res.json(updatedTransaction);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
