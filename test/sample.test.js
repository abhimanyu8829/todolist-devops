const http = require("http");
const assert = require("assert");

describe("Todo API Test", () => {
  it("GET / should return 200", (done) => {
    http.get("http://localhost:3000", (res) => {
      assert.strictEqual(res.statusCode, 200);
      done();
    });
  });
});
