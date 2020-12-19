"use strict";

const mongoose = require("mongoose");
const mongooseHidden = require("mongoose-hidden")({
  defaultHidden: { __v: true, password: true },
});

const verbose = !(
  !(process.env.VERBOSE === "true") || process.env.NODE_ENV === "test"
);
console.log("verbose:", verbose);
console.log("testing:", process.env.NODE_ENV === "test");
const consoleLog = (...message) => {
  !(process.env.VERBOSE === "true") || process.env.NODE_ENV === "test"
    ? null
    : console.log(...message);
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

    // GET issue:
    .get(async (req, res) => {
      consoleLog("_____GET_____");
      consoleLog("query:", req.query);
      let project = req.params.project;
      consoleLog("get", req.params);
      // consoleLog({ project: project, ...req.query })
      const projectIssues = await Issue.find({
        project: project,
        ...req.query,
      });
      consoleLog("projectIssues:", projectIssues);
      res.json(projectIssues);
    })

    // POST submit issue:
    .post((req, res) => {
      consoleLog("_____POST_____");
      let project = req.params.project;
      // consoleLog("post", req.params);
      // consoleLog("body", req.body);
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
      issue.save((error, result) => {
        if (error) {
          consoleLog("error: required field(s) missing");
          res.json({ error: "required field(s) missing" });
        } else {
          let saved = result;
          delete saved["__v"];
          consoleLog("save:", saved);
          res.json(result);
        }
      });
    })

    // Update issue
    .put((req, res) => {
      consoleLog("_____PUT_____");
      try {
        const body = req.body;
        consoleLog("body:", body);
        if (!req.body._id) {
          throw { error: "missing _id" };
        }
        const allBlank = Object.keys(body).every((k) => {
          // consoleLog("K:", k)
          return body[k] === "" || k == "_id";
        });
        if (allBlank) {
          throw { error: "no update field(s) sent", _id: body._id };
        }
        let updateIssue = {};
        Object.keys(body).forEach(function (item) {
          if (body[item]) {
            updateIssue[item] = body[item];
          }
        });
        updateIssue.open = body.open == "true";
        updateIssue.updated_on = new Date();
        consoleLog("updateIssue:", updateIssue);
        Issue.findByIdAndUpdate(body._id, updateIssue, (error, result) => {
          try {
            if (error) {
              throw { error: "could not update", _id: body.id };
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
    .delete((req, res) => {
      consoleLog("_____DELETE_____");
      consoleLog("delete", req.body);
      try {
        if (!req.body._id) {
          throw { error: "missing _id" };
        } else {
          Issue.findByIdAndDelete(req.body._id, (err, result) => {
            try {
              if (err) {
                throw { error: "could not delete", _id: req.body._id };
              } else {
                consoleLog({
                  result: "successfully deleted",
                  _id: req.body._id,
                });
                res.json({ result: "successfully deleted", _id: req.body._id });
              }
            } catch (err) {
              consoleLog("error:", err);
              res.json(err);
            }
          });
        }
      } catch (err) {
        consoleLog("error:", err);
        res.json(err);
      }
    });
};
