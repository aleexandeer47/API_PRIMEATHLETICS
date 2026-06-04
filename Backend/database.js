import mongoose from "mongoose"
import {config}  from "./src/config.js"

mongoose.connect(config.db.URI)

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("Database is connected")
})

connection.on("disconnected", () => {
    console.log("Database is disconnected")
}) 

connection.on("error", (error) => {
    console.error("error found"+ error)
})
