import Message from "../models/message.js"

export async function Createmessage(req, res) {
    const { fullname, email, subject, message } = req.body
    try {
        const savemessage = new Message({ fullname, email, subject, message })
        await savemessage.save()
        res.json({ message: "message saved successfully" })
    } catch (error) {
        console.error("error saving message", error)
        res.status(500).json({ message: "message not saved" })
    }

}