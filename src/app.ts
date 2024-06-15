import express from 'express'
import connectDB from './databas'
import authRouter from './routes/userAuthRoutes'
import cors from 'cors'
import dotenv from 'dotenv';
import profileRouter from './routes/userProfileRoutes';

dotenv.config();

const app = express()
const PORT = process.env.PORT || 4899

app.use(express.json())
app.use(cors())
app.use('/api/auth/users', authRouter)
app.use('/api/profile/users', profileRouter)

app.listen(PORT, async() => {
    await connectDB()
})