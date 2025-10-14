import mongoose from "mongoose";

export async function connectDB(url: string) {
    try {
        const connection = await mongoose.connect(url);
        console.log(`MongoDB connceted : ${connection.connection.host}`);
        return connection;
    } catch (error) {
        console.log(`Error in DB connection : ${error}`);
        throw error;   
    }
    
}