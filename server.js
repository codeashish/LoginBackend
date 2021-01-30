const express = require('express');
const app = express();
const colors = require('colors');
const morgan = require('morgan');
const connection = require('./config/db');
const env = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
var hpp = require('hpp');
const cors = require('cors');

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
});

app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(limiter);
app.use(hpp());
app.use(cors());
env.config({ path: './config/.env' });
connection();

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

const port = process.env.PORT || 8080;

const server = app.listen(port, () =>
	console.log(`Server is listen in ${process.env.NODE_ENV} mode on port ${port}`.yellow.bold)
);


const userRoute=require('./routes/user')

app.use('/users', userRoute);

const errorHandler = require("./middleware/error");
app.use(errorHandler);
app.use(cookieParser);
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error :${err.message}`.red.bold);
	//Close Server
	server.close(() => process.exit(1));
});
