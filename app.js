var express        = require("express"),
    app            = express(),
    bodyparser     = require("body-parser"),
    mongoose       = require("mongoose"),
    Mobile         = require("./models/mobiles"),
    Comment        = require("./models/comment"),
    passport       = require("passport"),
    localStrategy  = require("passport-local"),
    User           = require("./models/user"),
    methodOverride = require("method-override"),
    middleware     = require("./middleware"),
    flash          = require("connect-flash"),
    seedDB         = require("./seeds");

// seedDB();
mongoose.connect("mongodb://localhost/onlineMobileShop", {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static(__dirname+ "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
mongoose.set('useFindAndModify', false);
app.use(flash());
app.use(require("express-session")({
    secret: "This is online mobile shop",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.loggedin = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get("/", function(req, res) {
   res.render("home");
});

app.get("/mobiles", function(req, res) {
    Mobile.find({}, function(err, allMobiles) {
        if (err) {
            console.log(err);
        } else {
            res.render("mobiles/index", {mobiles: allMobiles});
        }
    });
});

app.post("/mobiles", middleware.isLoggenIn, function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newMobile = {name: name, image: image, description: desc, author: author};
    Mobile.create(newMobile, function(err, newMobile) {
        if (err) {
            console.log(err);
        } else {
            console.log("Added new mobile data to database: ")
            console.log(newMobile);
            res.redirect("/mobiles");
        }
    });
});

app.get("/mobiles/new", middleware.isLoggenIn, function(req, res) {
    res.render("mobiles/newMobile");
});

app.get("/mobiles/:id", function(req, res) {
    Mobile.findById(req.params.id).populate("comments").exec(function(err, foundMobile) {
        if (err) {
            console.log(err);
        } else {
            res.render("mobiles/show", {mobile: foundMobile});
        }
    });
});

app.get("/mobiles/:id/edit", middleware.checkMobileAuthorization, function(req, res) {
        Mobile.findById(req.params.id, function(err, foundMobile) {
            if (err) {
                req.flash("error", "Something went wrong!");
            } else {
                req.flash("success", "Succefully updated mobiles info");
                res.render("mobiles/edit", {mobile: foundMobile});
            }
        });    
});

app.put("/mobiles/:id", middleware.checkMobileAuthorization, function(req, res) {
    Mobile.findByIdAndUpdate(req.params.id, req.body.mobile, function(err, updatedMobile) {
        if (err) {
            res.redirect("/mobiles");
        } else {
            res.redirect("/mobiles/" + req.params.id);
        }
    });
});

app.delete("/mobile/:id", middleware.checkMobileAuthorization, function(req, res) {
    Mobile.findByIdAndDelete(req.params.id, function(err) {
        if (err) {
            res.redirect("/mobiles");
        } else {
            req.flash("success", "Successfully deleted post");
            res.redirect("/mobiles");
        }
    });
});

app.get("/mobiles/:id/comments/new", middleware.isLoggenIn, function(req, res) {
    Mobile.findById(req.params.id, function(err, mobile) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/newComment", {mobile: mobile});
        }
    });
});

app.post("/mobiles/:id/comments", middleware.isLoggenIn, function(req, res) {
    Comment.create({
        text: req.body.text,
        author: {
            id: req.user._id,
            username: req.user.username
        }
    }, function(err, comment) {
        if (err) {
            req.flash("error", "Something went wrong! Couldn't find comment");
            console.log("back");
        } else {
            Mobile.findById(req.params.id, function(err, mobile) {
                if (err) {
                    console.log(err);
                } else {
                    mobile.comments.push(comment);
                    mobile.save(function(err, updatedmobile) {
                        if (err) {
                            console.log("back");
                        } else {
                            req.flash("success", "Successfully Updated Comment!");
                            res.redirect("/mobiles/" + mobile._id);
                        }
                    });
                }
            });
        }
    });
});

app.get("/mobiles/:id/comments/:comment_id/edit", middleware.checkCommentAuthorization, function(req, res) { 
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("comments/edit", {mobile_id:req.params.id, comment:foundComment});
        }
    });
});

app.put("/mobiles/:id/comments/:comment_id", middleware.checkCommentAuthorization, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/mobiles/" + req.params.id);
        }
    });
});

app.delete("/mobiles/:id/comments/:comment_id", middleware.checkCommentAuthorization, function(req, res) {
    Comment.findByIdAndDelete(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Successfully deleted comment");
            res.redirect("back");
        }
    });
})

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Successfully Signed up");
            res.redirect("/mobiles");
        })
    });
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/mobiles",
        failureRedirect: "/login"
    }), function(req, res) {

});

app.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Succefully Logged out");
    res.redirect("/login");
});

app.listen(8080, "127.0.0.1", function() {
    console.log("The Online Mobile Shop Server has started!!!");
});