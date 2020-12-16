"use strict";

const mongoose = require("mongoose");
const mongooseHidden = require("mongoose-hidden")({
    defaultHidden: { __v: true, password: true },
  });

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
      console.log("_____")
      console.log("query:", req.query)
      let project = req.params.project;
      console.log("get", req.params);
      console.log({ project: project, ...req.query })
      const projectIssues = await Issue.find({ project: project, ...req.query });
      console.log(projectIssues);
      res.json(projectIssues);
    })

    // POST submit issue:
    .post((req, res) => {
            console.log("_____")
      let project = req.params.project;
      // console.log("post", req.params);
      // console.log("body", req.body);
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
          console.log("error: required field(s) missing");
          res.json({ error: "required field(s) missing" });
        } else {
          let saved = result;
          delete saved["__v"];
          console.log("save:", saved);
          res.json(result);
        }
      });
    })

    // Update issue
    .put((req, res) => {
            console.log("_____")
      const body = req.body;
      let updateIssue = {};
      Object.keys(body).forEach(function (item) {
        if (body[item]) {
          updateIssue[item] = body[item];
        }
      });
      updateIssue.open = body.open == "true";
      updateIssue.updated_on = new Date();
      console.log("updateIssue:", updateIssue);
      Issue.findByIdAndUpdate(body._id, updateIssue, (error, result) => {
        if (error) console.log(error);
        else {
          console.log("Updated:", res);
          console.log(`result: 'successfully updated'`, `'_id': ${_id }`)
          res.json({  result: 'successfully updated', '_id': req.body._id })
        };
      });
    })

    // Delete issue
    .delete((req, res) => {
            console.log("_____")
      console.log("delete", req.body);
      if (!req.body._id) {
        console.log("error: 'missing _id'");
        res.json({ error: "missing _id" });
      } else {
        Issue.findByIdAndDelete(req.body._id, (err, result) => {
          if (err) {
            console.log("error: 'missing _id'");
            res.json({ error: "missing _id" });
          } else {
            console.log(`result: "successfully deleted"`, `"_id": ${req.body._id}`);
            res.json({ result: "successfully deleted", "_id": req.body._id });
          }
        });
      }
    });
};
