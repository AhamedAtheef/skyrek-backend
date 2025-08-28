import Order from "../models/orders.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function CreateOrder(req, res) {
    try {

        if (req.user == null) {
            return res.status(401).json({ message: "please login first" })
        }
        //CBC"00201"
        const latestorder = await Order.find().sort({ date: -1 }).limit(1)
        let orderId = "CBC00202"

        if (latestorder.length > 0) {
            const lastorder = latestorder[0].orderID// "CBC00635"
            const lastorderwithoutPrefix = lastorder.replace("CBC", "")//"00635"
            const lastordernumber = parseInt(lastorderwithoutPrefix)//635
            const newordernumber = lastordernumber + 1//636
            const neworderwithoutprefix = newordernumber.toString().padStart(5, "0")//00636
            orderId = "CBC" + neworderwithoutprefix//"CBC00636" 

        }
        const items = [];
        let total = 0

        if (req.body.items != null && Array.isArray(req.body.items)) {
            for (const item of req.body.items) {
                const product = await Product.findOne({ productId: item.productId });

                if (product == null) {
                    return res.status(404).json({ message: "Product not found" });
                }
                items.push({
                    productId: product.productId,
                    price: product.price,
                    images: item.images,
                    name: product.productname,
                    qty: item.qty

                });
                
                total = req.body.total;
            }


        } else {
            return res.status(404).json({ message: "Product not found" })
        }
        const order = new Order({
            orderID: orderId,
            email: req.user.email,
            name: req.body.name,
            address: req.body.address,
            phone: req.body.phone,
            items: items,
            total: total,
            status: "Pending"
        })
        console.log(order)

        const result = await order.save();
        res.json({
            message: "Order Created Successfully",
            result: result
        })
    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ message: "Failed to create order" });
    }

}

export async function getOrders(req, res) {
    const page = parseInt(req.params.page) || 1;//get page
    const limit = parseInt(req.params.limit) || 10;//get limid or set default

    if (!req.user) {
        return res.status(401).json({ message: "Please Login First" });
    }

    try {
        let orders, countOrders, totalPages;

        if (req.user.role === "admin") {
            // Count all orders
            countOrders = await Order.countDocuments();
            totalPages = Math.ceil(countOrders / limit);//calculate total pages

            orders = await Order.find().skip((page - 1) * limit).limit(limit).sort({ date: -1 });

        } else {
            // Count only user's orders
            countOrders = await Order.countDocuments({ email: req.user.email });
            totalPages = Math.ceil(countOrders / limit);

            orders = await Order.find({ email: req.user.email }).skip((page - 1) * limit).limit(limit).sort({ date: -1 });
        }
        res.json({
            orders,
            totalPages
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
}

export async function updateOrder(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    try {
        const order = await Order.findOneAndUpdate({orderID:req.params.orderID});

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = req.body.status;
        order.notes = req.body.notes;

        const result = await order.save();

        res.json({
            message: "Order Updated Successfully",
            result: result
        });

    } catch (error) {
        console.error("Error updating order:", error);
        return res.status(500).json({ message: "Failed to update order" });
    }
}
