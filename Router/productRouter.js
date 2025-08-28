import express from "express";
import { createProducts, deleteProducts, getProducts, getproductsInfo, searchproducts, updateProducts} from "../Controllers/productController.js";

const productrouter=express.Router()

productrouter.post("/",createProducts)
productrouter.get("/:page/:limit/",getProducts)
productrouter.get("/", getProducts);
productrouter.get("/:productname", searchproducts);
productrouter.get("/:productId",getproductsInfo)
productrouter.delete("/:productId",deleteProducts)
productrouter.put("/:productId",updateProducts)

export default productrouter