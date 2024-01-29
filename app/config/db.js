import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/patitas", {
      
    });
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error("Error de conexión a MongoDB:", error);
  }
};
