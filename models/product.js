import mongoose from "mongoose";

const productShema=mongoose.Schema(
    {
    productId: {
        type: String,
        required: true,
        unique: true
    },
    productname: {
        type: String,
        required: true
    },
    altnames: {
        type: [String],
        default: []
    },
    labelledPrice: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    images: {
        type: [String],
        default: ["/default images"]
    },
    discription: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        required: true
    },
    category: {
        type: String,
        default: "cosmatics"
    } 

    }
)

const Product= mongoose.model("products",productShema)

export default Product

