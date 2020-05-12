var mongoose = require("mongoose"),
    Mobile   = require("./models/mobiles"),
    Comment = require("./models/comment");

var mobiles = [
    {
        name:"Nokia 9",
        image:"https://i.gadgets360cdn.com/products/large/1551023854_635_nokia_9_pureview.jpg?downsize=*:420&output-quality=80",
        description: "This Nokia 9 with 8GB of RAM, 64GB of internal storage with latest android PIE. It has 32megapixel moonlight selfie front camera, 5px and 13px rear cameras. It has 3500mph battery. It has latest snapdragon 425 processor."
    },
    {
        name:"FidgetGear P36 PRO", 
        image:"https://images-na.ssl-images-amazon.com/images/I/71hT9g8z1UL._SL1500_.jpg",
        description: "FidgetGear P36 PRO with 8GB of RAM, 32GB of internal storage with latest android OREO. It has 16megapixel selfie front camera, 5px and 13px rear cameras. It has 3000mph battery. It has latest snapdragon 450 processor."
    },
    {
        name:"Oppo Reno 3", 
        image:"https://www.reliancedigital.in/medias/Oppo-Reno-3Pro-8-128-64Mp-44Mpdual-SmartPhone-491667040-i-1-1200Wx1200H?context=bWFzdGVyfGltYWdlc3wxOTE4NTd8aW1hZ2UvanBlZ3xpbWFnZXMvaDc1L2gxMC85MjU1MjA3OTYwNjA2LmpwZ3xkYWFlNTkxNjg5MzE4MTJmYTIxNGQyNGYxM2YyOWZlZDdhYjAzMzM3ZGM3Y2U2ZmMxYTY0OGNjZWQyOTMyZmY1",
        description: "Oppo Reno 3 with 16GB of RAM, 128GB of internal storage with latest android Q. It has 64megapixel moonlight AI selfie front camera, 5px, 13px, 13px and 13px rear cameras. It has 5000mph battery. It has latest snapdragon 875 processor."
    }
];

function seedDB() {
    Mobile.deleteMany({}, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("removed all campgrounds");
            mobiles.forEach(function(mobile) {
                Mobile.create(mobile, function(err, mobile) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Added mobile");
                        Comment.create(
                        {
                            text: "This phone is great with specification but price is too high!",
                            author: "technical guruji"
                        }, function(err, comment) {
                            if (err) {
                                console.log(err);
                            } else {
                                mobile.comments.push(comment);
                                mobile.save();
                                console.log("Added new comment");
                            }
                        });
                    }
                });
            });
        }
    });
}

module.exports = seedDB;
