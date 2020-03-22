// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");
const moment = require("moment");

module.exports = function (app) {
    // Using the passport.authenticate middleware with our local strategy.
    // If the user has valid login credentials, send them to the members page.
    // Otherwise the user will be sent an error
    app.post("/api/login", passport.authenticate("local"), function (req, res) {
        // Sending back a password, even a hashed password, isn't a good idea
        res.json({
            email: req.user.email,
            id: req.user.id
        });
    });

    // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
    // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
    // otherwise send back an error
    app.post("/api/signup", function (req, res) {
        db.User.create({
            email: req.body.email,
            password: req.body.password
        })
            .then(function () {
                res.redirect(307, "/api/login");
            })
            .catch(function (err) {
                res.status(401).json(err);
            });
    });

    // Route for logging user out
    app.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/");
    });

    // Route for getting some data about our user to be used client side
    app.get("/api/user_data", function (req, res) {
        if (!req.user) {
            // The user is not logged in, send back an empty object
            res.json({});
        } else {
            // Otherwise send back the user's email and id
            // Sending back a password, even a hashed password, isn't a good idea
            res.json({
                email: req.user.email,
                id: req.user.id
            });
        }
    });
    app.post("/api/newdaily", function (req, res) {
        console.log(req);
        db.Daily.create({
            name: req.body.name
        }).then(function (data) {
            res.json(data);
        });
    });
    app.get("/api/alldailies", function (req, res) {
        db.Daily.findAll({}).then(function (data) {
            res.json(data);
        });
    });

    app.get("/api/pages", function (req, res) {
        db.Pages.findAll({}).then(function (data) {
            res.json(data);
        });
    });
    app.put("/api/modifydaily/:id", function (req, res) {
        var condition = "id = " + req.params.id;

        db.Daily.update(
            {
                completed: 1
            },
            {
                where: { id: req.params.id }
            }
        ).then(function (data) {
            res.json(data);
        });
    });

    app.put("/api/saveTask/:id/:val", function (req, res) {
        console.log(req.params.id)
        db.Tasks.update(
            {
                value: req.params.val
            },
            {
                where: { id: req.params.id }
            }
        ).then(function (data) {
            res.json(data);
        }).catch(err => console.log(err));
    });

    app.put("/api/saveCollectionItem/:id/:val", function (req, res) {
        db.Subcat.update({
            subValue: req.params.val
        },
        {where: {id: req.params.id}
    }).then(function (data) {
        res.json(data);
    }).catch(err => console.log(err))
    });




    app.post("/api/newmonthly/:chosen", async function (req, res) {
        try {
            const month = await monthlyCreate();

            res.render("monthly")
        } catch (err) {
            console.log(err);
        }

        async function monthlyCreate() {
            db.Monthly.create({
                month: req.params.chosen,
                year: moment().get("year")
            }).then(function (answers) {
                db.Pages.create({
                    name: answers.dataValues.month + " " + "Monthly Spread",
                    type: "monthly",
                    typeId: answers.dataValues.id
                })
                const daysInChosenMonth = moment().month(req.params.chosen).format("M")
                const daysInMonth = moment(`2020-${daysInChosenMonth}`, "YYYY-MM").daysInMonth()
                for (let i = 1; i < daysInMonth + 1; i++) {
                    db.Tasks.create({
                        date: i,
                        MonthlyId: answers.dataValues.id,
                    }).catch(err => console.log(err))
                }
            })

        }
    })



    app.post("/api/newcollection/:collect", async function (req, res) {
        try{
            let test = req.params.collect;
            let finalArray = test.split(",");
            // const postName = postCreate(finalArray)
            const postName = await postCreate(finalArray)
            const floop = await findDataz(postName)
            const moop = await pageCreatez(floop)
            const ferg = await createRest(floop, finalArray)
            res.render("bullet-notes")
            // await plop
            // console.log(plop)
        }
        catch(err) {console.log(err)}








            
            // const pageCreate = await pageCreatez(postName)
            // const findData = await findDataz(postName)
            // await createRest(findData, finalArray);
        
        

         async function postCreate(data) {
                try {
            const gerb = await db.Posts.create({
                name: data[0]
            })
            return data[0]
        } catch(err){
            console.log(err)
        }
            
        }
        async function pageCreatez(data){
            console.log(data)
            try {
               
           const gerb2 =  db.Pages.create({
                name: data.dataValues.name + " " + "Collection",
                type: "dailyspread",
                typeId: data.dataValues.id

        })
        return gerb2
    } catch(err) {console.log(err)}
    }
        async function findDataz(a){
            try{
            const gerb3 = db.Posts.findOne(
                {where: {
                name: a,
            }
        })
        return gerb3
        } catch(err){console.log(err)}
        }


        function createRest(data, array) {
                for (let i = 1; i < array.length; i++) {
                db.Subcat.create({
                    PostId: data.dataValues.id,
                    subName: array[i]
                })
            }

        };
    })


app.post("/api/newhabit/:habit", async function (req, res) {
    try {
        let hab = req.params.habit;
        let habArray = hab.split(",");
        await habCreate(habArray);
    } catch (err) {
        console.log(err);
    }

    function habCreate(data) {
        db.Journal.create({
            name: data[0],
            hab1Name: data[1],
            hab2Name: data[2],
            hab3Name: data[3],
            hab4Name: data[4],
            hab5Name: data[5],
            hab6Name: data[6],
            hab7Name: data[7],
            hab8Name: data[8],
            hab9Name: data[9]
        })
            .then(function (answers) {
                db.Pages.create({
                    name: answers.dataValues.name + " " + "Habit Tracker",
                    type: "habit",
                    typeId: answers.dataValues.id
                });
                res.json(answers);
            })
            .catch(err => console.log(err));
    }
});
}

