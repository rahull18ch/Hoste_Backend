const mongoose = require("mongoose");
// DATABASE_URL=mongodb://127.0.0.1:27017/hostel
require("dotenv").config();


const dbConnect = () => {
    console.log("url is",process.env.DATABASE_URL)
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser:true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("DB ka Connection is Successful"))
    .catch( (error) => {
        console.log("Issue in DB Connection");
        console.error(error.message);
        //iska matlab kya h ?
        process.exit(1);
    } );
}

module.exports = dbConnect;