import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from './app.js'

dotenv.config({
    path: './.env'
})


connectDB()
.then(()=>{
    app.on("Error", (error)=>{
    console.log("Error found")
             })

   app.listen(process.env.PORT || 800, ()=>{
    console.log(`Server is running at PORT: ${process.env.PORT}`)
   })
})
.catch( (error)=>{
console.log(`MONGODB Connection Failed`, error)
})










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