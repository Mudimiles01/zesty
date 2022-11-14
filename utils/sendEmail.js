const nodemailer = require("nodemailer");
const nodeoutlook = require('nodejs-nodemailer-outlook')
const fs = require("fs");
const ejs = require("ejs");

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/admin/mailview.ejs", {mail: text, subject: subject},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: process.env.CUSTOMMAIL,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });

        // await transporter.sendMail({
        //     from: process.env.CUSTOMMAIL,
        //     to: email,
        //     subject: subject,
        //     text: text,
        // });

        // console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;