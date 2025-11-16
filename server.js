import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import ownerRouter from './routes/ownerRouter.js'
import bookingRouter from "./routes/bookingRouter.js";

//Initialize express app

const app=express();

//connect DB
await connectDB()


app.use(cors());

app.use(express.json())


app.use('/api/user',userRouter)
app.use('/api/owner',ownerRouter)
app.use('/api/bookings',bookingRouter)
const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))