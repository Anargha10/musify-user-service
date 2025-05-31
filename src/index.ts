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
app.use('/api/v1', userRoutes);

app.get('/', (req, res) => {
    res.send('User Service is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDb();
});
