const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
const url = "/api/issues/chai-test"

suite("Functional Tests", () => {
  suite("POST requests", () => {

    test("every field", (done) => {
      chai
        .request(server)
        .post(url)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_title: "Testing with Chai",
          issue_text: "Uh oh, looks like we're testing this thing.",
          created_by: "Chai Test",
          assigned_to: "Marc",
          status_text: "We're on it",
        })
        .end((err, res) => {
          // console.log("res:", res.body);
          assert.equal(res.status, 200);
          assert.hasAllKeys(
            res.body,
            [
              "_id",
              "project",
              "open",
              "issue_title",
              "issue_text",
              "created_by",
              "assigned_to",
              "status_text",
              "created_on",
              "updated_on",
            ],
            "all keys are present"
          );
          assert.equal(res.body.project, "chai-test");
          assert.equal(res.body.open, true);
          assert.equal(res.body.issue_title, "Testing with Chai");
          assert.equal(res.body.created_by, "Chai Test");
          done();
        });
    });
    test("only required fields", (done) => {
      chai
        .request(server)
        .post(url)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_title: "Testing with Chai",
          issue_text: "Uh oh, looks like we're testing this thing.",
          created_by: "Chai Test",
        })
        .end((err, res) => {
          // console.log("res:", res.body);
          assert.equal(res.status, 200);
          assert.hasAllKeys(
            res.body,
            [
              "_id",
              "project",
              "open",
              "issue_title",
              "issue_text",
              "created_by",
              "assigned_to",
              "status_text",
              "created_on",
              "updated_on",
            ],
            "all keys are present"
          );
          assert.equal(res.body.project, "chai-test");
          assert.equal(res.body.open, true);
          assert.equal(res.body.issue_title, "Testing with Chai");
          assert.equal(res.body.created_by, "Chai Test");
          assert.equal(res.body.assigned_to, "");
          done();
        });
    });
    test("missing required fields", (done) => {
      chai
        .request(server)
        .post(url)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_text: "This should throw an error",
        })
        .end((err, res) => {
          // console.log("res:", res.body);
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });

  });

  suite("POST requests", () => {
    test("view issues", (done) => {
      chai
        .request(server)
        .get(url)
        .end((err, res) => {
          // console.log("body:", res.body)
          assert.isArray(res.body, "body is an array")
          assert.isObject(res.body[0], "body contains an object")
          done();
        })
    })
  });

});

// Create an issue with every field: POST request to /api/issues/{project} OK
// Create an issue with only required fields: POST request to /api/issues/{project} OK
// Create an issue with missing required fields: POST request to /api/issues/{project} OK
// View issues on a project: GET request to /api/issues/{project} 
// View issues on a project with one filter: GET request to /api/issues/{project}
// View issues on a project with multiple filters: GET request to /api/issues/{project}
// Update one field on an issue: PUT request to /api/issues/{project}
// Update multiple fields on an issue: PUT request to /api/issues/{project}
// Update an issue with missing _id: PUT request to /api/issues/{project}
// Update an issue with no fields to update: PUT request to /api/issues/{project}
// Update an issue with an invalid _id: PUT request to /api/issues/{project}
// Delete an issue: DELETE request to /api/issues/{project}
// Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
// Delete an issue with missing _id: DELETE request to /api/issues/{project}
