import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
	try {
		
		const { fullName, email, password } = req.body;

		const user = await User.findOne({ email });

		console.log(user);

		if (user) {
			return res.status(400).json({ message: "User already exists" });
		}

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			fullName,
			email,
			password: hashedPassword,
		});

		if (newUser) {
			// Generate JWT token here
			const token = generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				accessToken: token, // 将 token 添加到响应中
				_id: newUser._id,
				fullName: newUser.fullName,
				email: newUser.email,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		const token = generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			accessToken: token, // 将 token 添加到响应中
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
export const getUser = async (req, res) => {
	// const { userId } = req.user; // 这种方式确实不中用
	const userId = req.user._id; // 直接获取 _id
	const isUser = await User.findOne({ _id: userId });
	if(!isUser){
		return res.sendStatus(401);
	}
	return res.json({
		user: isUser,
		message: "",
	});
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};