"use strict";

const mongoose = require("mongoose");
const mongooseHidden = require("mongoose-hidden")({
  defaultHidden: { __v: true, password: true },
});

const verbose = !!(process.env.VERBOSE === "true");
console.log("verbose:", verbose);
console.log("testing:", process.env.NODE_ENV === "test");
const consoleLog = (...message) => {
  !(process.env.VERBOSE === "true") ? null : console.log(...message);
};

// Create a Schema for issue
const { Schema } = mongoose;
const IssueSchema = new Schema({
  project: { type: String, required: true },
  open: { type: Boolean, required: true, default: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, required: false, default: "" },
  status_text: { type: String, required: false, default: "" },
  created_on: { type: Object, required: false, default: new Date() },
  updated_on: { type: Object, required: false, default: new Date() },
  __v: { select: false },
});

// hides '__v' & 'password' fields
IssueSchema.plugin(mongooseHidden);

// Create the Model for issue
const Issue = mongoose.model("Issues", IssueSchema);

module.exports = (app) => {
  app
    .route("/api/issues/:project")

    // GET issue from database:
    .get(async (req, res) => {
      consoleLog("_____GET_____");
      consoleLog("query:", req.query);
      let project = req.params.project;
      consoleLog("get", req.params);
      const projectIssues = await Issue.find({
        project: project,
        ...req.query,
      });
      consoleLog("projectIssues:", projectIssues);
      res.json(projectIssues);
    })

    // POST submit new issue:
    .post((req, res) => {
      consoleLog("_____POST_____");
      let project = req.params.project;
      // creates new issue object.
      const newIssue = {
        project,
        open: true,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        created_on: new Date(),
        updated_on: new Date(),
      };
      const issue = new Issue(newIssue);
      // saves it to the db.
      issue.save((error, result) => {
        try {
          if (error) {
            throw { error: "required field(s) missing" };
          } else {
            let saved = result;
            delete saved["__v"];
            consoleLog("save:", saved);
            res.json(result);
          }
        } catch (err) {
          consoleLog("error:", err);
          res.json(err);
        }
      });
    })

    // PUT Update issue
    .put(async (req, res) => {
      consoleLog("_____PUT_____");
      try {
        const body = req.body;
        consoleLog("body:", body);
        // checking if _id field was filled.
        if (!req.body._id) {
          throw { error: "missing _id" };
        }
        // checking if any input fields is filled
        const allBlank = Object.keys(body).every((key) => {
          // consoleLog("K:", k)
          return body[key] === "" || key == "_id";
        });
        if (allBlank) {
          throw { error: "no update field(s) sent", _id: body._id };
        }
        // checking if  _id exists in the db.
        const existingID = await Issue.findById(body._id, (error, result) => {
          return result;
        });
        if (!existingID) {
          throw { error: "could not update", _id: body._id };
        }
        // creating object with all the updates.
        let updateIssue = {};
        Object.keys(body).forEach(function (item) {
          if (body[item]) {
            updateIssue[item] = body[item];
          }
        });
        updateIssue.open = body.open == "true";
        updateIssue.updated_on = new Date();
        consoleLog("updateIssue:", updateIssue);
        // finds and updated the entry with the new updates.
        Issue.findByIdAndUpdate(body._id, updateIssue, (error, result) => {
          try {
            if (error) {
              throw { error: "could not update", _id: body._id };
            }
            const message = { result: "successfully updated", _id: body._id };
            consoleLog("PUT:", message);
            res.json(message);
          } catch (err) {
            consoleLog("error:", err);
            res.json(err);
          }
        });
      } catch (err) {
        if (err._id) {
          consoleLog("error:", err);
          res.json(err);
        } else {
          consoleLog(err);
          res.json(err);
        }
      }
    })

    // Delete issue
    .delete(async (req, res) => {
      consoleLog("_____DELETE_____");
      consoleLog("delete", req.body);
      const body = req.body;
      try {
        // was _id field filled?
        if (!body._id) {
          throw { error: "missing _id" };
        }
        // does the _id exist on the db?
        const existingID = await Issue.findById(body._id, (error, result) => {
          return result;
        });
        if (!existingID) {
          throw { error: "could not delete", _id: body._id };
        }
        // finds and deletes the db entry.
        Issue.findByIdAndDelete(req.body._id, (err, result) => {
          try {
            if (err) {
              throw { error: "could not delete", _id: body._id };
            } else {
              consoleLog({
                result: "successfully deleted",
                _id: body._id,
              });
              res.json({ result: "successfully deleted", _id: body._id });
            }
          } catch (err) {
            consoleLog("error:", err);
            res.json(err);
          }
        });
      } catch (err) {
        consoleLog("error:", err);
        res.json(err);
      }
    });
};
