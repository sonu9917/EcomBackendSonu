import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
	const JWT_SECRET = '123456789987456123'

	const token = jwt.sign({ userId }, JWT_SECRET, {
		expiresIn: "15d",
	});

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, // MS
		httpOnly: true, 
		sameSite: "strict",
	});

	

	return token

	
};

export default generateTokenAndSetCookie;
