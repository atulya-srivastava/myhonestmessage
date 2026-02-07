import mongoose ,{Schema,Document} from "mongoose";

export interface Message extends Document {
    content: string; // Encrypted message content (hex)
    encryptedAESKey: string; // RSA-encrypted AES key (hex)
    iv: string; // IV for AES decryption (hex)
    createdAt: Date;
} //what will a message contain? definitely content and the time when it was posted


//i think this is the mongoose schema for the message
const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String, // Encrypted message content (hex)
        required: true,
    },
    encryptedAESKey: {
        type: String, // RSA-encrypted AES key (hex)
        required: true,
    },
    iv: {
        type: String, // IV for AES decryption (hex)
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

//there are two schemas defined here one is message the other one is user so define a document first

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    publicKey: string;           // JWK format, openly accessible
    encryptedPrivateKey: string; // Wrapped with password
    recoveryWrappedKey: string;  // Wrapped with recovery code
    createdAt: Date;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    messages: Message[];
}
// this is the typescript type for the user
//extends Document makes it compatible with Mongoose documents (so you can use .save(), .populate(), etc.).

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    publicKey: {
        type: String,
        required: [true, 'Public key is required'],
    },
    encryptedPrivateKey: {
        type: String,
        required: [true, 'Encrypted private key is required'],
    },
    recoveryWrappedKey: {
        type: String,
        required: [true, 'Recovery wrapped key is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    verifyCode: {
        type: String,
        required: [true, 'Verification code is required'],
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, 'Verification code expiry is required'],
    },
    isVerified: {
        type:Boolean,
        default: false,
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true,
    },
    messages: [MessageSchema],
});

//const UserSchema: Schema<User> = new Schema({...}); basic syntax
//type,required (array with [0 for boolean , 1 for message]),default,unique,match,trim


const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);
//const UserModel = (reuse_if_exists) || (create_new_model)

export default UserModel;