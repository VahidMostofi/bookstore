const mongoose = require('mongoose')

const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true
};

let retryCount = 1;
let maxRetry = 30;
let waitTime = 1000;
let connectToDB = () => {
    mongoose.connect(process.env.MONGODB_URL, options)
    .then( function() {
        console.log('MongoDB is connected');
    }).catch( function(err) {
        console.log('try',retryCount,'couldn\'t connect to db');
        if(retryCount < maxRetry){
            console.log('trying again')
            retryCount++;
            waitTime *= 1.2;
            setTimeout(connectToDB, waitTime);
        }else{
            console.log(err);
            process.exit(1);
        }
    });
}

connectToDB()
