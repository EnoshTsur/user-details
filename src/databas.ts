import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI
        if (mongoUri) {
            await mongoose.connect(process.env.MONGO_URI ?? '')
            console.log("Cennected to DB");
        } else {
            throw new Error("MONGO_URI is missing")
        }
    } catch (e) {
        console.error('Error connecting DB: ', e);
        process.exit(1)
    }
}

export default connectDB