import express from 'express'
import connectDB from './databas'
import router from './routes/userRoutes'
import cors from 'cors'
import dotenv from 'dotenv';

dotenv.config();

const app = express()
const PORT = process.env.PORT || 4899

app.use(express.json())
app.use(cors())
app.use('/api/users', router)

app.listen(PORT, async() => {
    await connectDB()
})