const ErrorHandler = require('../utils/errorHandler');


module.exports = (err, req, res, next) => {      
   
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // wrong mongoose ID error message
    if(err.name === "CastError"){
        const message = "Resource not found or corrupted "+err.path;
        err = new ErrorHandler(message, 400)
    }

    // mongoose duplicate error message
    if(err.code == 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400)
    }

    //wrong JWT error message
    if(err.name === "jsonWebTokenError"){
        const message = "Json web token is invalid, try again";
        err = new ErrorHandler(message, 400)
    }

    
    // JWT Expire message
    if(err.name === "TokenExpiredError"){
        const message = "Json web token is expired, try again";
        err = new ErrorHandler(message, 400)
    }


    res.status(err.statusCode).json({
        success : false,
       // error : err.stack,
        error : err.message,
        //error : err,
    })
}