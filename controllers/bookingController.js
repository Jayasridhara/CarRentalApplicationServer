import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

export const checkAvailability = async (car, pickupDate, returnDate) => {
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    if (returnD < pickup) {
        console.log("Invalid date range: return date is before pickup date");
        return false; // car is NOT available
    }

    
    const bookings = await Booking.find({
        car,
        pickupDate: { $lte: returnD },
        returnDate: { $gte: pickup },
    });

    console.log("Bookings found:", bookings.length);

    return bookings.length === 0;
};

// API to Check Availability of Cars for the given Date and location
export const checkAvailabilityOfCar = async (req,res)=>{

    try {
  const {pickupLocation, pickupDate, returnDate} = req.body

  // fetch all available cars for the given location
  const cars = await Car.find({location:pickupLocation, isAvaliable: true})

  // check car availability for the given date range using promise
  const availableCarsPromises = cars.map(async (car)=>{
    const isAvaliable = await checkAvailability(car._id, pickupDate, returnDate)
    return {...car._doc, isAvaliable: isAvaliable}
  })

  let availableCars = await Promise.all(availableCarsPromises);
  availableCars = availableCars.filter(car => car.isAvaliable === true)

  res.json({success: true, availableCars})
} catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//API  to create vooking
export const createBooking = async (req, res)=>{
    try {
        const {_id} = req.user;
        const {car, pickupDate, returnDate} = req.body

        const isAvailable = await checkAvailability(car, pickupDate, returnDate)
        if(!isAvailable){
            return res.json({success: false, message: "Car is not available"})
        }

        const carData = await Car.findById(car)

        // Calculate price based on pickupDate and returnDate
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24))
        const price = carData.pricePerDay * noOfDays;
        await Booking.create({car,owner:carData.owner,user:_id,pickupDate,returnDate,price});

        res.json({success:true,message:"Booking Created"})
    }
    catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }

}

export const getUserBookings=async (req,res)=>{
    try{
        const {_id}=req.user;
        console.log("id",_id)
        const bookings=await Booking.find({user:_id}).populate("car").sort({createdAt:-1})
       res.json({success:true,bookings})

    }
     catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }

}


export const getOwnerBookings=async (req,res)=>{
    try{
        if(req.user.role !== "owner")
        {
            return res.json({success:false,message:"Unauthorized"});
        }
        const bookings=await Booking.find({owner:req.user._id}).populate("car user").select("-user.password").sort({createdAt:-1})
        res.json({success:true,bookings})
    }
     catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }

}

export const changeBookingStatus=async (req,res)=>{
    try{
      
        const {_id}=req.user;
        const {bookingId,status}=req.body;
         const booking=await Booking.findById(bookingId)
        if(booking.owner.toString()!==_id.toString())
        {
            return res.json({success:false,message:"Unauthorized"});
        }
        booking.status=status;
        await booking.save();
        res.json({success:true,message:"Status Updated"})
    }
     catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }

}




