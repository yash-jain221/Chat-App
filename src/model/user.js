const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        sid: {
            type: String,
            required: true
        },
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
                type: String,
                trim: true
            }
        }],
        warning: {
            type: Boolean,
            default: false
        }
    }
);

userSchema.set('timestamps', true)
const User = mongoose.model("User", userSchema);
module.exports = User