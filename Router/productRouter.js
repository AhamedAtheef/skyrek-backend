import express from "express";
import { createProducts, deleteProducts, getProducts, getproductsInfo, searchproducts, updateProducts } from "../Controllers/productController.js";

const productrouter = express.Router()

productrouter.post("/", createProducts);

productrouter.get("/:page/:limit", getProducts);   // <-- prefixed "page"


productrouter.get("/search/:productname", searchproducts); // <-- prefixed "search"
productrouter.get("/info/:productId", getproductsInfo);    // <-- prefixed "info"

productrouter.delete("/:productId", deleteProducts);
productrouter.put("/:productId", updateProducts);


export default productrouter