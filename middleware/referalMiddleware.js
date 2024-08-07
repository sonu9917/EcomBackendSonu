import User from "../model/user";

const refferalMiddleware = async (req,res,next) => {
    try {
    
        let token = req.headers.authorization; 
        token = JSON.parse(token)
      
    
        if (!token) {
          return res.status(401).json({ error: 'Unauthorized - Token not provided' });
        }
    
        // Decode JWT token to get payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace 'your_jwt_secret' with your actual JWT secret
    
        console.log(decoded)
    
        // Find user by _id from decoded token
        const user = await User.findById(decoded.userId);
    
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        // Attach user details to the request object for future use in route handlers
        req.user = user;
    
        // Proceed to next middleware or route handler
        next();
      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
        console.error('Admin access middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
}

export default refferalMiddleware