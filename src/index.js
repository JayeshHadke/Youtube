import dotenv from 'dotenv';
import connectDB from './db/dbConnection.js';
import {app} from './app.js';
dotenv.config(
    {
        path: '.env'
    }
);
connectDB()
    .then(() => {
        app.on('error', (error) => {
            console.error(`Server is not Deployed: ${error.message}`);
            process.exit(1);
        });
        app.listen(process.env.PORT || 2000, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => { 
        console.error(`Mongo Connection Error : ${error.message}`);
        process.exit(1);
    });
