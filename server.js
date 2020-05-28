const express = require('express');
const connectDB = require('./config/db');

const app = express();
//connect database
connectDB();

//Init Middleware
//gets data to req.body
app.use(express.json({extended: false}));//no need of bodyparser

app.get('/', (req, res) => res.send('API Running'));

//define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('server started at port 5000'));
