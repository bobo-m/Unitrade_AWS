module.exports = theCactchFun => (req, res, next) => {

    Promise.resolve(theCactchFun(req, res, next)).catch(next);
    
}