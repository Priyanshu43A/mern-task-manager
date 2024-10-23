// utils/setInitialProfilePicture.js

module.exports.setInitialProfilePicture = (userName) => {
    const initial = userName.charAt(0).toUpperCase();
    const imageUrl = `https://ui-avatars.com/api/?name=${initial}&size=256`; // Using the UI Avatars API
    return imageUrl;
}