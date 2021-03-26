if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: ""}
}else{
    module.exports = {mongoURI: "mongodb://10.1.0.2:27017/blogapp"}
}