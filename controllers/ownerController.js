import imagekit from "../config/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";
export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user; // Assumes user ID is attached to req by JWT middleware

        await User.findByIdAndUpdate(_id, { role: "owner" });

        res.json({ success: true, message: "Now you can list cars" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        let car = JSON.parse(req.body.carData);      
        const imageFile = req.file;
        
        const fileBuffer=fs.readFileSync(imageFile.path);
        const response= await imagekit.upload({
            file:fileBuffer,
            fileName:imageFile.originalname,
            folder:'/cars'

        })

     var optimizedImageUrl = imagekit.url({
        path: response.filePath,
        transformation: [
            {width: "1280"},
            {quality: "auto"},
            {format: "webp"},
        ]
    });

    const image=optimizedImageUrl;
    await Car.create({...car,owner:_id,image})
    res.json({ success: true, message: "Car Added successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id });
        res.json({ success: true, cars });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const toggleCarAvailability = async (req, res) => {
    try {
        const {_id}=req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);
        // Check if the car belongs to the current user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: 'Unauthorized access' });
        }
        car.isAvaliable = !car.isAvaliable;
        await car.save();

        res.json({ success: true, message: `Car availability toggled to ${car.isAvaliable ? 'Available' : 'Unavailable'}`, car });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const deleteCar = async (req, res) => {
    try {
        const {_id}=req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);

        // Checking if car belongs to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // Instead of deleting, we set the car as unavailable and clear the owner reference
        car.owner = null;
        car.isAvaliable = false;

        await car.save();

        res.json({ success: true, message: "Car Removed" });


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
export const getDashboardData = async (req, res) => {


    try{
        const {_id,role}=req.user;
        if(role!=="owner")
        {
            return res.json({success:false,message:"Unauthorized"})

        }
        const cars=await Car.find({owner:_id})
        const bookings=await Booking.find({owner:_id}).populate('car').sort({createdAt:-1})
        
        const pendingBookings = await Booking.find({owner: _id, status:"pending" })
        const completedBookings = await Booking.find({owner: _id, status:"confirmed" })

        // Calculate monthlyRevenue from bookings where status is confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.
        status === 'confirmed').reduce((acc, booking)=> acc + booking.
        price, 0)

        const dashboardData = {
        totalCars: cars.length,
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        completedBookings: completedBookings.length,
        recentBookings:bookings.slice(0,3),
        monthlyRevenue
        }
        res.json({success:true,dashboardData})

    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }

}

export const updateUserImage = async (req, res)=>{
    try {

        const { _id } = req.user;

        const imageFile = req.file;

        // Upload Image to ImageKit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
        file: fileBuffer,
        fileName: imageFile.originalname,
        folder: '/users'
        })

        // optimization through imagekit URL transformation
        var optimizedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    {width: "1280"},
                    {quality: "auto"},
                    {format: "webp"},
                ]
            });
            const image=optimizedImageUrl;
            await User.findByIdAndUpdate(_id,{image})
            res.json({success:true ,message:"Image Updated"})
     } 
     catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}



