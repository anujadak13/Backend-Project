import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config({
    path: './env'
})


connectDB()










// const app =express()
// ;(async()=>{
// try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/ ${DB_NAME}` )
//     app.on("Error", (error)=>{
//         console.log("Error found")
//     })
//     app.listen(process.env.PORT, ()=>{
//         console.log(`App is listeing at port ${process.env.PORT}`)
//     })
// } catch (error) {
//  console.log("ERROR", error)
//  throw error   
// }

// })()