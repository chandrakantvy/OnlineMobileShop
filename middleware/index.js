var Mobile = require("../models/mobiles"),
    Comment = require("../models/comment");
    
var middlewareObj = {};

middlewareObj.isLoggenIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } 
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
}

middlewareObj.checkMobileAuthorization = function(req, res, next) {
    if (req.isAuthenticated()) {
        Mobile.findById(req.params.id, function(err, foundMobile) {
            if (err) {
                req.flash("error", "Mobile not found!");
                res.redirect("back");
            } else {
                if ((foundMobile.author.id).equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have that permission");
                    res.redirect("back");
                }
            }
        });
    } else { 
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}

middlewareObj.checkCommentAuthorization = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
                if ((foundComment.author.id).equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have that permission");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!"); 
        res.redirect("back");
    }
}

module.exports = middlewareObj;