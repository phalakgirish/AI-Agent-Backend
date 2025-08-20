import nodemailer from 'nodemailer';

export  async function SendEmail (staff_email_id,password) {
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: "pravinkarande2483@gmail.com",
            pass: "pncwuuffakfwttdg",
            },
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: 'pravinkarande2483@gmail.com', // sender address
            to: staff_email_id, // list of receivers
            subject: "User Login Credentials", // Subject line
            text: "Hello world?", // plain text body
            html: `
            <div>
                <p>Hi User,</p>
                <p style="margin-bottom:10px;">Please Find below <b>User Credential</b> for Login.</p>
                <p style="margin:5px;font-family:Arial">User Email Id:<b>${staff_email_id}</b></p>
                <p style="margin:5px;font-family:Arial">Password:<b>${password}</b></p>

                <p ><b>Note:</b> This is system generated email.<p>
                <p>Thanks & Regards,<br /></p>
            <div>`, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        //
        // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
        //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
        //       <https://github.com/forwardemail/preview-email>
        //
}


const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
}

export default async function SendVerifyEmail(emailid, otp) {
    // console.log(emailid , otp);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "",
            pass: "",
        },
    });

    const info = await transporter.sendMail({
        from: '',
        to: emailid,
        subject: "Verify Email OTP Generated",
        text: `Your OTP is ${otp}`,
        html: `
            <div>
                <p>Hi User,</p>
                <p style="margin-bottom:10px;">Please Find below <b>Generated OTP</b> for email verification.</p>
                <p style="font-size:50px;margin:5px;font-family:Arial"><b>${otp}</b></p>
                <p ><b>Note:</b> This is a system generated email.<p>
                <p>Thanks & Regards,<br />CosmoHub Team</p>
            </div>
        `,
    });

    console.log("Message sent: %s", info.messageId);
}


export  async function SendReminderConsuptionEmail (staff_email_id,data,per) {
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: "pravinkarande2483@gmail.com",
            pass: "pncwuuffakfwttdg",
            },
        });

        let rows = '';
        data.forEach((cred,index) => {
            rows += `
                <tr style="text-align:center;">
                    <td style="border: 1px solid #ccc; padding: 8px;">${index+1}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${cred.client_id}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${cred.client_name}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${cred.client_allocated_minutes}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${cred.client_consumed_minutes}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${cred.client_remaning_minutes}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${cred.client_consumed_per}</td>
                </tr>
            `;
        });

        let subject = `${(per == 90)?'90% or more':'100%'} minutes consumed client list`

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: 'pravinkarande2483@gmail.com', // sender address
            to: staff_email_id, // list of receivers
            subject: subject, // Subject line
            text: "Hello world?", // plain text body
            html: `
            <div>
                <p>Hi Super Admin,</p>
                <p style="margin-bottom:10px;">Please Find below client list, consumed ${(per == 90)?'90% or more':'100%'} of their allocated minutes.</p>
                
                <table style="border-collapse: collapse; width: 100%; margin-bottom: 15px;">
                    <tr>
                        <th style="border: 1px solid #ccc; padding: 8px; background-color: #f2f2f2;">Sr No.</th>
                        <th style="border: 1px solid #ccc; padding: 8px; background-color: #f2f2f2;">Client Id</th>
                        <th style="border: 1px solid #ccc; padding: 8px; background-color: #f2f2f2;">Client Name</th>
                        <th style="border: 1px solid #ccc; padding: 8px; background-color: #f2f2f2;">Allocated Minutes</th>
                        <th style="border: 1px solid #ccc; padding: 8px; background-color: #f2f2f2;">Consumed Minutes</th>
                        <th style="border: 1px solid #ccc; padding: 8px; background-color: #f2f2f2;">Remaining Minutes</th>
                        <th style="border: 1px solid #ccc; padding: 8px; background-color: #f2f2f2;">Consumed Minutes Per. (%)</th>
                    </tr>
                    ${rows}
                </table>

                <p ><b>Note:</b> This is system generated email.<p>
                <p>Thanks & Regards,<br />Ai-Calling Team.</p>
            <div>`, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        //
        // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
        //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
        //       <https://github.com/forwardemail/preview-email>
        //
}


