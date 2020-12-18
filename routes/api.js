"use strict";

const mongoose = require("mongoose");
const mongooseHidden = require("mongoose-hidden")({
  defaultHidden: { __v: true, password: true },
});

const verbose = !(!(process.env.VERBOSE === "true") || (process.env.NODE_ENV === "test"));
console.log("verbose:", verbose);
console.log("testing:", (process.env.NODE_ENV === "test"));

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
      !verbose? null : console.log("_____GET_____");
      !verbose? null : console.log("query:", req.query);
      let project = req.params.project;
      !verbose? null : console.log("get", req.params);
      // !verbose? null : console.log({ project: project, ...req.query })
      const projectIssues = await Issue.find({
        project: project,
        ...req.query,
      });
      !verbose? null : console.log("projectIssues:", projectIssues);
      res.json(projectIssues);
    })

    // POST submit issue:
    .post((req, res) => {
      !verbose? null : console.log("_____POST_____");
      let project = req.params.project;
      // !verbose? null : console.log("post", req.params);
      // !verbose? null : console.log("body", req.body);
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
          !verbose? null : console.log("error: required field(s) missing");
          res.json({ error: "required field(s) missing" });
        } else {
          let saved = result;
          delete saved["__v"];
          !verbose? null : console.log("save:", saved);
          res.json(result);
        }
      });
    })

    // Update issue
    .put((req, res) => {
      !verbose? null : console.log("_____PUT_____");
      try {
        const body = req.body;
        !verbose? null : console.log("body:", body)
        if (!req.body._id) {
          throw ({ error: "missing _id" });
        }

        const allBlank = Object.keys(body).every((k) => {
          // !verbose? null : console.log("K:", k)
          return (body[k] === "" || k == "_id");
        });
        if (allBlank) {
          throw ({ error: "no update field(s) sent", _id: body._id })
        }

        let updateIssue = {};
        Object.keys(body).forEach(function(item) {
          if (body[item]) {
            updateIssue[item] = body[item];
          }
        });
        updateIssue.open = body.open == "true";
        updateIssue.updated_on = new Date();
        !verbose? null : console.log("updateIssue:", updateIssue);

        Issue.findByIdAndUpdate(body._id, updateIssue, (error, result) => {
          try {
            if (error) {
              throw ({ error: "could not update", _id: body.id })
            }
            !verbose? null : console.log(
              `result: 'successfully updated'`,
              `'_id': ${body._id}`
            );
            res.json({ result: "successfully updated", _id: body._id });
          }
          catch (err) {
            !verbose? null : console.log(`error: ${err.error}`, `_id: ${err._id}`)
            res.json(err)
          }

        });
      }
      catch (err) {
        if (err._id) {
          !verbose? null : console.log(`error: ${err.error}`, `_id: ${err._id}`)
          res.json(err)
        } else {
          !verbose? null : console.log(`error: ${err.error}`)
          res.json(err)
        }
      }
    })

    // Delete issue
    .delete((req, res) => {
      !verbose? null : console.log("_____DELETE_____");
      !verbose? null : console.log("delete", req.body);
      if (!req.body._id) {
        !verbose? null : console.log("error: 'missing _id'");
        res.json({ error: "missing _id" });
      } else {
        Issue.findByIdAndDelete(req.body._id, (err, result) => {
          if (err) {
            !verbose? null : console.log("error: 'missing _id'");
            res.json({ error: "missing _id" });
          } else {
            !verbose? null : console.log(
              `result: "successfully deleted"`,
              `"_id": ${req.body._id}`
            );
            res.json({ result: "successfully deleted", _id: req.body._id });
          }
        });
      }
    });
};
