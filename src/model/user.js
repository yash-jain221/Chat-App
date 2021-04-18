const mongoose =  require('mongoose')

const User = mongoose.model('User',{
    username: {
        type: String,
        required: true,
        trim: true
    },
    room: {
        type: String,
        required: true,
        trim: true
    },
    texts: [{
        text: {
            type:String,
            trim: true
        }
    }]
})

module.exports = User