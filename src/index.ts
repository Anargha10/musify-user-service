import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import userRoutes from './route.js'
import cors from 'cors'
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const connectDb= async()=>{
    try {
        mongoose.connect(process.env.MONGO_URI as string, {
            dbName: "Spotify",
        });
        console.log('Mongo DB connected')
    } catch (error) {
        console.log(error);
    }
}

app.use(express.json());
// app.use(cors())
app.use('/api/v1', userRoutes);

app.get('/', (req, res) => {
    res.send('User Service is running!');
});

const allowedOrigins = ['https://www.imanargha.shop', 'https://api.imanargha.shop']; // Add your API domain too if the API itself might need to access something
// app.use(cors({
//     origin: function (origin, callback) {
//         // allow requests with no origin (like mobile apps or curl requests)
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) === -1) {
//             const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//             return callback(new Error(msg), false);
//         }
//         return callback(null, true);
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Ensure OPTIONS is included
//     allowedHeaders: ['Content-Type', 'Authorization'], // Add any custom headers your frontend sends
//     credentials: true // If you are sending cookies/authentication headers
// }));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDb();
});
