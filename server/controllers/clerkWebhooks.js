import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res)=>{
    try {
        // create a svix instance with clerk webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        //Gettimng Headers
        const header = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // verifying Headers
        await whook.verify(JSON.stringify(req.body), headers)

        // getting data from request body
        const {data,type} = req.body

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
        }

        // switch cases for different events

        switch (type) {
            case "User.created":{
                await User.create(userData);
                break;
            }
            case "User.updated":{
                await User.findByAndUpdate(data.id, userData);
                break;
            }
             case "User.deleted":{
                await User.findIdAndDelete(data.id);
                break;
            }
        
            default:
                break;
        }
        res.json({success: true, message: "Webhook Received"})
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
        
        
    }
}
export default clerkWebhooks;