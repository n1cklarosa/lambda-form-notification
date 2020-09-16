var aws = require("aws-sdk");
var ses = new aws.SES({ region: "ap-southeast-2" });

let email_to = process.env.EMAIL_ADDRESS;
let email_from = process.env.EMAIL_ADDRESS_FROM;

const sendEmail = async (formDetails, context) => {
  var emailBody = `Name: ${formDetails.name}
        <br> Content: ${formDetails.content} 
        <br> Email Address: ${formDetails.email}
        <br> Phone: ${formDetails.phone}
        `;

  var params = {
    Destination: {
      ToAddresses: [email_to],
    },
    Message: {
      Body: {
        Text: { Data: emailBody },

        Html: { Data: emailBody },
      },

      Subject: { Data: `New Entry - ${formDetails.formName}` },
    },
    Source: email_from,
  };

  var email = await ses
    .sendEmail(params, function (err, data) {
      if (err) {
        console.log("We failed?", err);
        context.fail({ status: false, msg: err });
      } else {
        return true;
      }
    })
    .promise();

  return true;
};

exports.handler = async (event, context, callback) => {
  console.log("Event Received", event);

  var formDetails = event.body;

  if (!formDetails.formName) {
    context.fail({ status: false, msg: "Sorry, no good" });
  }

  var end = await sendEmail(formDetails, context);

  if (end === true) {
    context.succeed({
      status: true,
      msg: "Thanks for getting in touch, I will get back you asap",
    });
  } else {
    context.fail({ status: false, msg: "Something went bad here" });
  }
};
