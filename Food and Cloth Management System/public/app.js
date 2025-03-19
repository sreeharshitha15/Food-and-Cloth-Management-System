const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serve static files from the 'public' directory

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/donation', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Mongoose Schema
const donationSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    category: String,
    quantity: Number,
    foodDate: Date,
    note: String
});

const Donation = mongoose.model('Donation', donationSchema);

// Function to save data to a JSON file
const saveDataToFile = (data, filename) => {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// GET route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// POST route to handle form submission
app.post('/submit', async (req, res) => {
    const { myname1, myemail, myphone, myadd, myfood, quantity, fooddate, note } = req.body;

    const newDonation = new Donation({
        name: myname1,
        email: myemail,
        phone: myphone,
        address: myadd,
        category: myfood,
        quantity: quantity,
        foodDate: new Date(fooddate),
        note: note
    });

    try {
        // Save to MongoDB
        const savedDonation = await newDonation.save();

        // Save to JSON file
        saveDataToFile(savedDonation.toObject(), 'donation.json');

        res.status(200).send('Data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Error saving data');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
