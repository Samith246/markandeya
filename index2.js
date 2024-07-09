const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const Razorpay = require('razorpay');
const path = require('path');

const app = express();
const port = 3001;

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'carsdata'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});

// Razorpay instance
const razorpay = new Razorpay({
    key_id: 'rzp_test_pvtc0wlp67EAqm',
    key_secret: 'R6J1MSmEQI3K113p0fWXWkfS'
});

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the public and uploads directories
app.use(express.static('public2'));
app.use('/uploads', express.static('uploads'));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public2/home.html');
});

// Function to create user-specific tables if they don't already exist
function createUserTables(username) {
    const sanitizedUsername = username.replace(/\s+/g, '_');
    const bookingsTable = `${sanitizedUsername}_bookings`;
    const wishlistTable = `${sanitizedUsername}_wishlist`;

    const bookingsQuery = `
        CREATE TABLE IF NOT EXISTS ${bookingsTable} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pid INT,
            car_brand VARCHAR(50),
            model VARCHAR(50),
            numberplate VARCHAR(20) NOT NULL,
            price VARCHAR(20) NOT NULL,
            engine_capacity VARCHAR(255) NOT NULL,
            horsepower VARCHAR(20) NOT NULL,
            torque VARCHAR(20) NOT NULL,
            mileage VARCHAR(20) NOT NULL,
            fuel_type VARCHAR(255) NOT NULL,
            transmission VARCHAR(255) NOT NULL,
            registration_year VARCHAR(20) NOT NULL,
            kms_driven VARCHAR(20) NOT NULL,
            bodytype VARCHAR(20) NOT NULL,
            ownership VARCHAR(20) NOT NULL,
            image TEXT NOT NULL,
            booking_amount VARCHAR(20) NOT NULL,
            FOREIGN KEY (pid) REFERENCES cars(id)
        )`;

    const wishlistQuery = `
        CREATE TABLE IF NOT EXISTS ${wishlistTable} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pid INT,
            car_brand VARCHAR(50),
            model VARCHAR(50),
            numberplate VARCHAR(20) NOT NULL,
            price VARCHAR(20) NOT NULL,
            engine_capacity VARCHAR(255) NOT NULL,
            horsepower VARCHAR(20) NOT NULL,
            torque VARCHAR(20) NOT NULL,
            mileage VARCHAR(20) NOT NULL,
            fuel_type VARCHAR(255) NOT NULL,
            transmission VARCHAR(255) NOT NULL,
            registration_year VARCHAR(20) NOT NULL,
            kms_driven VARCHAR(20) NOT NULL,
            bodytype VARCHAR(20) NOT NULL,
            ownership VARCHAR(20) NOT NULL,
            image TEXT NOT NULL,
            booking_amount VARCHAR(20) NOT NULL,
            FOREIGN KEY (pid) REFERENCES cars(id)
        )`;

    connection.query(bookingsQuery, (err, results) => {
        if (err) {
            console.error(`Error creating table ${bookingsTable}: ` + err.stack);
        } else {
            console.log(`Table ${bookingsTable} created or already exists`);
        }
    });

    connection.query(wishlistQuery, (err, results) => {
        if (err) {
            console.error(`Error creating table ${wishlistTable}: ` + err.stack);
        } else {
            console.log(`Table ${wishlistTable} created or already exists`);
        }
    });
}

// Route to handle user login and table creation
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Dummy user validation (replace with your authentication logic)
    if (username) {
        createUserTables(username);
        res.json({ success: true, message: 'Login successful', username: username });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Route to check if car is in wishlist
app.post('/wishlist/:carId', (req, res) => {
    const { carId } = req.params;
    const { user } = req.body;
    const username = user.name.replace(/\s+/g, '_');
    const wishlistTable = `${username}_wishlist`;

    const query = `SELECT * FROM ${wishlistTable} WHERE pid = ?`;
    connection.query(query, [carId], (err, results) => {
        if (err) {
            console.error(`Error checking wishlist: ` + err.stack);
            return res.status(500).send('Error checking wishlist');
        }
        res.json({ inWishlist: results.length > 0 });
    });
});

// Route to save user details
app.post('/save-user-details', (req, res) => {
    const { username, email, mobile } = req.body;

    const query = `
        INSERT INTO users (username, email, mobile)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE mobile = ?`;

    connection.query(query, [username, email, mobile, mobile], (err, results) => {
        if (err) {
            console.error('Error inserting user details: ' + err.stack);
            return res.status(500).send('Error inserting user details');
        }
        res.status(200).send('User registered successfully');
    });
});

// Route to add to wishlist
app.post('/add-to-wishlist', (req, res) => {
    const { id, user } = req.body;
    const username = user.name.replace(/\s+/g, '_');
    const wishlistTable = `${username}_wishlist`;

    const query = `
        INSERT INTO ${wishlistTable} (pid, car_brand, model, numberplate, price, engine_capacity, horsepower, torque, mileage, fuel_type, transmission, registration_year, kms_driven, bodytype, ownership, image, booking_amount)
        SELECT id, car_brand, model, numberplate, price, engine_capacity, horsepower, torque, mileage, fuel_type, transmission, registration_year, kms_driven, bodytype, ownership, image, booking_amount FROM cars WHERE id = ?`;

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error(`Error adding to wishlist: ` + err.stack);
            return res.status(500).send('Error adding to wishlist');
        }
        res.json({ success: true, message: 'Added to wishlist' });
    });
});

// Route to remove from wishlist
app.post('/remove-from-wishlist', (req, res) => {
    const { id, user } = req.body;
    const username = user.name.replace(/\s+/g, '_');
    const wishlistTable = `${username}_wishlist`;

    const query = `DELETE FROM ${wishlistTable} WHERE pid = ?`;

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error(`Error removing from wishlist: ` + err.stack);
            return res.status(500).send('Error removing from wishlist');
        }
        res.json({ success: true, message: 'Removed from wishlist' });
    });
});

// Route to create Razorpay order
app.post('/create-order', (req, res) => {
    const { amount } = req.body;

    const options = {
        amount: amount * 100,  // amount in paise
        currency: "INR",
    };

    razorpay.orders.create(options, (err, order) => {
        if (err) {
            console.error('Error creating Razorpay order: ' + err.stack);
            return res.status(500).send('Error creating order');
        }
        res.json(order);
    });
});

// Existing routes to fetch car data
app.get('/cars', (req, res) => {
    const { car_brand, minPrice, maxPrice, minYear, maxYear, fueltype, transmission, bodytype, ownership } = req.query;

    let query = 'SELECT * FROM cars WHERE 1=1';
    let soldOutQuery = 'SELECT * FROM soldout_cars WHERE 1=1';
    let queryParams = [];
    let soldOutQueryParams = [];

    if (car_brand && car_brand !== 'Other') {
        query += ' AND car_brand = ?';
        soldOutQuery += ' AND car_brand = ?';
        queryParams.push(car_brand);
        soldOutQueryParams.push(car_brand);
    } else if (car_brand === 'Other') {
        const knownBrands = ['Maruti', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Skoda', 'Volkswagen', 'Ford'];
        query += ' AND car_brand NOT IN (?)';
        soldOutQuery += ' AND car_brand NOT IN (?)';
        queryParams.push(knownBrands);
        soldOutQueryParams.push(knownBrands);
    }

    if (minPrice) {
        query += ' AND price >= ?';
        soldOutQuery += ' AND price >= ?';
        queryParams.push(parseInt(minPrice));
        soldOutQueryParams.push(parseInt(minPrice));
    }

    if (maxPrice) {
        query += ' AND price <= ?';
        soldOutQuery += ' AND price <= ?';
        queryParams.push(parseInt(maxPrice));
        soldOutQueryParams.push(parseInt(maxPrice));
    }

    if (minYear) {
        query += ' AND registration_year >= ?';
        soldOutQuery += ' AND registration_year >= ?';
        queryParams.push(parseInt(minYear));
        soldOutQueryParams.push(parseInt(minYear));
    }

    if (maxYear) {
        query += ' AND registration_year <= ?';
        soldOutQuery += ' AND registration_year <= ?';
        queryParams.push(parseInt(maxYear));
        soldOutQueryParams.push(parseInt(maxYear));
    }

    if (fueltype) {
        query += ' AND fuel_type = ?';
        soldOutQuery += ' AND fuel_type = ?';
        queryParams.push(fueltype);
        soldOutQueryParams.push(fueltype);
    }

    if (transmission) {
        query += ' AND transmission = ?';
        soldOutQuery += ' AND transmission = ?';
        queryParams.push(transmission);
        soldOutQueryParams.push(transmission);
    }

    if (bodytype) {
        query += ' AND bodytype = ?';
        soldOutQuery += ' AND bodytype = ?';
        queryParams.push(bodytype);
        soldOutQueryParams.push(bodytype);
    }

    if (ownership) {
        query += ' AND ownership = ?';
        soldOutQuery += ' AND ownership = ?';
        queryParams.push(ownership);
        soldOutQueryParams.push(ownership);
    }

    connection.query(query, queryParams, (err, carResults) => {
        if (err) {
            console.error('Error fetching cars: ' + err.stack);
            return res.status(500).send('Error fetching cars');
        }

        connection.query(soldOutQuery, soldOutQueryParams, (err, soldOutResults) => {
            if (err) {
                console.error('Error fetching sold out cars: ' + err.stack);
                return res.status(500).send('Error fetching sold out cars');
            }

            const results = [...carResults, ...soldOutResults];
            res.json(results);
        });
    });
});

app.get('/car-details/:id', (req, res) => {
    const carId = req.params.id;
    const query = 'SELECT * FROM cars WHERE id = ?';
    connection.query(query, [carId], (err, results) => {
        if (err) {
            console.error('Error fetching car details: ' + err.stack);
            res.status(500).send('Error fetching car details');
            return;
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send('Car not found');
        }
    });
});

// Route to fetch user's wishlist
app.post('/wishlist', (req, res) => {
    const { user } = req.body;
    const username = user.name.replace(/\s+/g, '_');
    const wishlistTable = `${username}_wishlist`;

    const query = `
        SELECT cars.* FROM cars
        JOIN ${wishlistTable} ON cars.id = ${wishlistTable}.pid`;

    connection.query(query, (err, results) => {
        if (err) {
            console.error(`Error fetching wishlist: ` + err.stack);
            return res.status(500).send('Error fetching wishlist');
        }
        res.json(results);
    });
});

app.post('/submit-car', upload.array('images', 12), (req, res) => {
    const { name, mobile, gmail, carBrand, model, registrationYear, numberplate, kmsDriven, enginecapacity, horsepower, torque, mileage, fuelType, bodytype, ownership, transmission, price } = req.body;
    const images = req.files.map(file => file.filename).join(',');

    const query = `
        INSERT INTO sellers (name, mobile, gmail, car_brand, model, registration_year, numberplate, kms_driven, engine_capacity, horsepower, torque, mileage, fuel_Type, bodytype, ownership, transmission, price, images)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [name, mobile, gmail, carBrand, model, registrationYear, numberplate, kmsDriven, enginecapacity, horsepower, torque, mileage, fuelType, bodytype, ownership, transmission, price, images];

    console.log('Inserting car with values:', values); // Debugging line

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting car details: ' + err.stack);
            return res.status(500).send('Error listing car');
        }
        res.status(200).send('Car listed successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
