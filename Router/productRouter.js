import express from "express";
import { createProducts, deleteProducts, getallproducts, getProductbyId,  getProducts,  searchproducts, updateProducts } from "../Controllers/productController.js";

const productrouter = express.Router()

productrouter.post("/", createProducts);
   // <-- pr 
productrouter.get("/overview/:productId", getProductbyId);
productrouter.get("/data",getallproducts);
productrouter.get("/search/:productname", searchproducts); // <-- prefixed "search"
productrouter.delete("/:productId", deleteProducts);
productrouter.put("/:productId", updateProducts);
productrouter.get("/allproducts/:page/:limit", getProducts);


export default productrouter