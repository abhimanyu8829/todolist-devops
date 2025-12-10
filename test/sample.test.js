const request = require('supertest');
const app = require('../server');

describe('Todo API Test', () => {
  it('GET / should return 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  it('GET /api/todos should return todos array', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.todos)).toBe(true);
  });

  it('POST /api/todos should create a new todo', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Test Todo' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body.todo).toBeDefined();
    expect(res.body.todo.title).toBe('Test Todo');
  });
});

