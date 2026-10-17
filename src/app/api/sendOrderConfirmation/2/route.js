import { sendEmail } from "../../../util/mail.utils"

export async function POST(){
    const sender ={
        name: "ALi Jan",
        address: 'no-reply@example.com'
    }

    const receipients =[
        {
            name: "john doe",
            address : 'john.doe@example.com',
        }
    ]

    try{
        const result = await sendEmail({
            sender,
            receipients,
            subject: "Welcome to our website",
            message: "You are welcome to our platform"
        })

        return Response.json({
           accepted: result.accepted, 
        })
    }
    catch(error){
        return Response.json({message: "Unable to send email this time"},{
            status: 500
        })
    }
}