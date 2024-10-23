// Function to send a response
const sendResponse = (
    res,
    status,
    success,
    message,
    data = {},
    error = {}
  ) => {
    res.status(status).json({ success, message, ...data, ...error });
  };


 module.exports = sendResponse;

