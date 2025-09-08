import Product from "../models/product.js";
import { isAdmin } from "./userController.js";


export async function createProducts(req, res) {


    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const productData = req.body;


    try {
        const existingProduct = await Product.findOne({ productId: productData.productId });
        if (existingProduct) {
            return res.status(400).json({ message: "Product ID already exists. Use a unique ID." });
        }


        const product = new Product(productData);
        const savedProduct = await product.save();


        return res.json({
            message: "Product created successfully",
            product: savedProduct
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Failed to create product", error: error.message });
    }


}


export async function deleteProducts(req, res) {

    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    try {
        const productId = req.params.productId;

        // Deleting the product from the database
        await Product.deleteOne({ productId: productId });
        return res.json({ message: "Product deleted successfully." });

    } catch (error) {

        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Failed to delete product." });
    }
}


export async function updateProducts(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const data = req.body;
    const productId = req.params.productId
    data.productId = productId

    try {
        await Product.updateOne(
            {
                productId: productId,
            }, data
        )
        return res.json({ message: "Product Update Successfully", data })


    } catch (error) {

        console.error("Error updating products", error)
        res.status(403).json({ message: "Failed to update products" })
        return
    }


}

export async function getProductbyId(req, res) {
    const productId = req.params.productId; // get productId from URL
    console.log("Requested Product ID:", productId);

    try {
        // Find the product in the database by productId
        const product = await Product.findOne({ productId: productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (!product.isAvailable) {
            return res.status(404).json({ message: "Product is not available" });
        }

        // Send back the product
        return res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ message: "Failed to fetch product" });
    }
}


export async function searchproducts(req, res) {
    const productname = req.params.productname;
    try {
        const products = await Product.find({
            productname: { $regex: productname, $options: "i" },
            isAvailable: true
        });

        res.json({ products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch products" });
    }
}

export async function getProducts(req, res) {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;

    try {
        let query = {};
        if (!isAdmin(req)) {
            query.isAvailable = true;
        }

        // Count total documents for this query
        const count = await Product.countDocuments(query);
        const totalPages = Math.ceil(count / limit);

        // Fetch products for current page
        const products = await Product.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 }); // Use createdAt (make sure your schema has timestamps)

        return res.json({ products, totalPages });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Failed to fetch products", error: error.message });
    }
}
