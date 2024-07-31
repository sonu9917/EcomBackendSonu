import sendEmail from "../utils/sendEmail.js";

// Function to send email
const sendRenewalEmail = async (user, membership) => {
    try {
        await sendEmail(
            user.email, "Your Membership Renewal Reminder", `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { padding: 20px; background-color: #f4f4f4; border-radius: 8px; }
            h1 { color: #333; }
            p { color: #555; }
            .button { padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Membership Renewal Reminder</h1>
            <p>Dear ${user.firstName},</p>
            <p>Your membership is set to expire on ${membership.expirationDate.toDateString()}.</p>
            <p>Please renew it before the expiration date to continue enjoying our services.</p>
            <a href="http://localhost:5173/membership" class="button">Renew Now</a>
            <p>If you have any questions, feel free to contact us.</p>
          </div>
        </body>
        </html>
      `,
        )
        console.log(`Renewal email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending renewal email:', error);
    }
};


export default sendRenewalEmail
