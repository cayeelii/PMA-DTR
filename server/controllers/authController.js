//register user
const register = (req, res) => {

    const { username, password } = req.body;

    res.json({
        message: "User registered successfully",
        username: username
    });

};


//login user
const login = (req, res) => {

    const { username, password } = req.body;

    res.json({
        message: "Login successful",
        username: username
    });

};


module.exports = {register,login};