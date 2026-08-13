import app from "./src/app.js";
import { appConfig } from './src/config/config.js'
import { connectDB } from "./src/config/db.js";


connectDB()

app.listen(appConfig.PORT, () => {
    console.log("Server is running on 3000")
})