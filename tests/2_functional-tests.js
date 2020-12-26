const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
const url = "/api/issues/chai-test";
let _id;

suite("Functional Tests", () => {
  suite("POST requests", () => {
    test("Create an issue with every field", (done) => {
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
          _id = res.body._id;
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
    test("Create an issue with only required fields", (done) => {
      chai
        .request(server)
        .post(url)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_title: "Testing with Chai",
          issue_text: "Oh crud",
          created_by: "Other Chai Test",
        })
        .end((err, res) => {
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
          assert.equal(res.body.created_by, "Other Chai Test");
          assert.equal(res.body.assigned_to, "");
          done();
        });
    });
    test("Create an issue with missing required fields", (done) => {
      chai
        .request(server)
        .post(url)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          issue_text: "This should throw an error",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });

  suite("GET requests", () => {
    test("View issues on a project", (done) => {
      chai
        .request(server)
        .get(url)
        .end((err, res) => {
          assert.isArray(res.body, "body is an array");
          assert.isObject(res.body[0], "body contains an object");
          done();
        });
    });
    test("View issues on a project with one filter", (done) => {
      chai
        .request(server)
        .get(url)
        .query({ created_by: "Chai Test" })
        .end((err, res) => {
          assert.isArray(res.body, "body is an array");
          assert.isObject(res.body[0], "body contains an object");
          for (const issue of res.body) {
            assert.include(issue, { created_by: "Chai Test" });
          }
          done();
        });
    });
    test("View issues on a project with multiple filters", (done) => {
      chai
        .request(server)
        .get(url)
        .query({
          created_by: "Other Chai Test",
          issue_text: "Oh crud",
        })
        .end((err, res) => {
          assert.isArray(res.body, "body is an array");
          assert.isObject(res.body[0], "body contains an object");
          for (const issue of res.body) {
            assert.include(issue, { created_by: "Other Chai Test" });
            assert.include(issue, { issue_text: "Oh crud" });
          }
          done();
        });
    });
  });

  suite("PUT requests", () => {
    test("Update one field on an issue", (done) => {
      chai
        .request(server)
        .put(url)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id: _id,
          status_text: "This should throw an error",
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            result: "successfully updated",
            _id: _id,
          });
          done();
        });
    });
    test("Update multiple fields on an issue", (done) => {
      chai
        .request(server)
        .put(url)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          _id: _id,
          status_text: "This should throw an error",
          open: false,
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            result: "successfully updated",
            _id: _id,
          });
          done();
        });
    });
    test("Update an issue with missing _id", (done) => {
      chai
        .request(server)
        .put(url)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({
          status_text: "This should throw an error",
          open: false,
        })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "missing _id" });
          done();
        });
    });
    test("Update an issue with no fields to update", (done) => {
      chai
        .request(server)
        .put(url)
        .send({
          _id: _id,
        })
        .end((err, res) => {
          assert.deepEqual(res.body, {
            error: "no update field(s) sent",
            _id: _id,
          });
          done();
        });
    });
    test("Update an issue with an invalid _id", (done) => {
      chai
        .request(server)
        .put(url)
        .send({
          _id: "5f665eb46e296f6b9b6a504d",
          open: false,
        })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "could not update" , _id: "5f665eb46e296f6b9b6a504d"});
          done();
        });
    });
  });

  suite("DELETE requests", () => {
    test("Delete an issue", (done) => {
      chai
        .request(server)
        .delete(url)
        .send({
          _id: _id,
        })
        .end((err, res) => {
          assert.deepEqual(res.body, { result: 'successfully deleted', _id: _id })
          done();
        });
    });
    test("Delete an issue with an invalid _id", (done) => {
      chai
        .request(server)
        .delete(url)
        .send({
          _id: "5f665eb46e296f6b9b6a504d",
        })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: 'could not delete', '_id': "5f665eb46e296f6b9b6a504d" })
          done();
        });
    });
    test("Delete an issue with missing _id", (done) => {
      chai
        .request(server)
        .delete(url)
        .end((err, res) => {
          assert.deepEqual(res.body, { error: 'missing _id' })
          done();
        });
    });
  });
});
