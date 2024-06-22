import express, { Request, Response } from "express";
import connectDB from "./database";
import authRouter from "./routes/userAuthRoutes";
import cors from "cors";
import dotenv from "dotenv";
import profileRouter from "./routes/userProfileRoutes";
import morgan from "morgan";
import logger from "./logger/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4899;

app.use(express.json());
app.use(cors());
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use("/api/auth/users", authRouter);
app.use("/api/profile/users", profileRouter);

app.get('/health', async (_: Request, res: Response) => {
  return res.status(200).json({ health: 'ok'})
})

app.listen(PORT, async () => {
  console.log('running on port', PORT);
  
  await connectDB();
});
