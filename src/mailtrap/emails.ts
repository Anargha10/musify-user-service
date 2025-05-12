import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"
import { mailtrapclient, sender } from "./mailtrap.config.js"

export const sendVerificationEmail= async(email:string, verificationToken:string)=>{
const recipient= [{email}]
    try {
        const response= await mailtrapclient.send({
            from:sender,
            to: recipient,
            subject:"Verify your Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationToken}",verificationToken),
            category: "Email Verification"
        })
        console.log("Email Sent successfully", response)
    } catch (error) {
        console.error(`error sending verification`,error)
        throw new Error(`error sending verification email ${error}` )
    }
}



export const sendWelcomeEmail= async(email:string, name:string)=>{
const recipent =[{email}]

try {
  const response=  await mailtrapclient.send({
        from: sender,
        to: recipent,
        template_uuid:"ee336bdb-40c4-4f12-81d1-dffaf4217384",
        template_variables: {
            "company_info_name": "Musify",
            "name": name,
          }
        
    })
    console.log("welcome email sent successfully", response)
} catch (error) {
    console.error('error sending welcome email', error);
    throw new Error(`Error sending welcome email: ${ error}`)
}
}


export const sendPasswordResetEmail= async(email:string, resetURL:string)=>{
    const recipent= [{email}]

    try {
        const response= await mailtrapclient.send({
            from: sender,
            to: recipent,
            subject: "Reset your password",
            html:PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}',resetURL),
            category:'password reset'
        })
        console.log('Email send response:', response); 
    
        
        return response;
    } catch (error) {
        console.error('error sending password rest email', error)
        throw new Error(`Error sending password reset email:${error}`)
    }
}


export const sendResetSuccessEmail= async(email:string)=>{
    const recipent =[{email}]

    try {
        const response= await mailtrapclient.send({
            from:sender,
            to:recipent,
            subject:"password reset successful",
            html:PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "password reset",

        })
        console.log('password reset successful', response)
    } catch (error) {
        console.log('error in sending reset success email',error)
        console.error(`error sending password reset success email: ${error}`)
    }
}