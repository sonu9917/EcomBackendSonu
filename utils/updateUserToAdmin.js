import User from "../model/user.js";

const updateUserRoleToAdmin = async (userId, key) => {
    try {
        const user = await User.findById(userId);
        if (user) {
            user.role = 'admin';
            user.subscription = key;

            // Credit $10 to the user's wallet if not already credited
            if (!user.walletCredited) {
                const referrer = await User.find({referralCode:user.referredBy});
                console.log("referrer",referrer)
                if (referrer) {
                    referrer.wallet += 10;
                    user.walletCredited = true;
                    await user.save();
                }
            }

            await user.save();
            
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error updating user role:', error);
    }
};

export default updateUserRoleToAdmin;
