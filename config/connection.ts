import { ethers } from "ethers";
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

export default async function connectRPC(endpoint: string) {
    try {
        const provider = new ethers.JsonRpcProvider(endpoint);
        const network = await provider.getNetwork();
        console.log(`RPC connected chainID: ${network.chainId}`);
        return provider;
    } catch (error) {
        console.log(`Error in RPC conncetion : ${error}`);
        throw error;
    }
}