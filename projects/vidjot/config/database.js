if (process.env.NODE_ENV === 'production') {
    module.exports = {mongoURI: 'mongodb+srv://hermanomark:mark@vidjot-prod-wk8io.mongodb.net/test?retryWrites=true&w=majority'}
} else {
    module.exports = {mongoURI: 'mongodb://localhost/vidjot-dev'}
}