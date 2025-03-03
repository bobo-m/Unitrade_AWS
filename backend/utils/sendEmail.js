// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//     const transporter = nodemailer.createTransport({
//         service : process.env.SMTP_SERVICE,
//         auth : {
//             user: process.env.SMTP_MAIL,
//             pass: process.env.SMTP_APP_PASSWORD,
//         }
//     })

//     const mailOptions = {
//         from : process.env.SMTP_MAIL,
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//     }

//     await transporter.sendMail(mailOptions);
// };


// module.exports = sendEmail;

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_APP_PASSWORD,
        }
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,  // User's email
        subject: options.subject,  // Email subject
        html: options.message,  // Use 'html' for HTML emails
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
