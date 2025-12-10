const http = require("http");
const assert = require("assert");

describe("Todo API Test", () => {
  it("GET / should return 200", (done) => {
    http.get("http://localhost:3000", (res) => {
      assert.strictEqual(res.statusCode, 200);
      done();
    });
  });

  it("GET /api/todos should return todos array", (done) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/todos",
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        assert.strictEqual(res.statusCode, 200);
        const parsed = JSON.parse(data);
        assert(Array.isArray(parsed.todos));
        done();
      });
    });
    req.on("error", (e) => {
      done(e);
    });
    req.end();
  });

  it("POST /api/todos should create a new todo", (done) => {
    const postData = JSON.stringify({ title: "Test Todo" });
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/todos",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        assert.strictEqual(res.statusCode, 201);
        const parsed = JSON.parse(data);
        assert(parsed.todo);
        assert.strictEqual(parsed.todo.title, "Test Todo");
        done();
      });
    });
    req.on("error", (e) => {
      done(e);
    });
    req.write(postData);
    req.end();
  });
});

