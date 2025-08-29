import Product from "../models/product.js";
import { isAdmin } from "./userController.js";


export async function createProducts(req, res) {


    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied Admins only" })
    }
    const product = new Product(req.body)

    try {
        const response = await product.save()
        res.json({
            message: "product created successfully",
            product: response
        })


    } catch (error) {
        console.error("Error creating product:", error)
        return res.status(500).json({ Message: "failed to create product" })
    }


}

export async function getProducts(req, res) {
    const page = parseInt(req.params.page) || 1
    const limit = parseInt(req.params.limit);


    try {
        if (isAdmin(req)) {
            let countPage = await Product.countDocuments();
            let totalPages = Math.ceil(countPage / limit);


            const products = await Product.find().skip((page - 1) * limit).limit(limit).sort({ date: -1 });
            return res.json({ products, totalPages });

        } else {
            const products = await Product.find({ isAvailable: true });
            // Keep the same structure so frontend always works
            return res.json({ products, totalPages: 1 });
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "failed to fetch products" });
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

export async function getproductsInfo(req, res) {
    const productId = req.params.productId;

    try {
        const product = await Product.findOne({ productId: productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (isAdmin(req)) {
            return res.json(product); // return the object
        }

        if (product.isAvailable) {
            return res.json(product);
        }

        return res.status(404).json({ message: "Product is not Available" });

    } catch (error) {
        console.error("Error fetching products", error);
        res.status(500).json({ message: "Failed to fetch products" });
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
