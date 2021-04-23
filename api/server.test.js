// Write your tests here
const request = require('supertest');
const db = require('../data/dbConfig');
const server = require('./server');

const dummyData = {
  username: 'nickS',
  password: 'nick1234'
}

test('sanity', () => {
  expect(true).not.toBe(false)
})

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await db('users').truncate();
})

afterAll(async () => {
  await db.destroy();
})

describe("server endpoint tests", () => {
  describe("/register endpoint tests", () => {
    it("returns status code 201", async () => {
      const response = await request(server).post('/api/auth/register').send(dummyData)
      expect(response.status).toBe(201)
    })
    it("returns the newly created user", async () => {
      const response = await request(server).post('/api/auth/register').send(dummyData)
      expect(response.body[0]).toMatchObject({id:1, username: 'nickS'})
    })
  })

  describe("/login endpoint tests", () => {
    it("returns status code 200", async () => {
      await request(server).post('/api/auth/register').send(dummyData) //have to register first!
      const response = await request(server).post('/api/auth/login').send(dummyData)
      expect(response.status).toBe(200)
    })
    it("returns token in body of response", async () => {
      await request(server).post('/api/auth/register').send(dummyData)
      const response = await request(server).post('/api/auth/login').send(dummyData)
      const token = response.body.token
      expect(token).toBeDefined()
    })
  })

  describe("/jokes endpoint tests", () => {
    it("will not allow access with no token", async () => {
      const response = await request(server).get('/api/jokes')
      expect(response.status).toBe(401)
    })
    it("returns jokes when token is provided", async () => {
      await request(server).post('/api/auth/register').send(dummyData)
      const login = await request(server).post('/api/auth/login').send(dummyData)
      const token = login.body.token;
      const response = await request(server).get('/api/jokes').set('Authorization', token)
      expect(response.body).toHaveLength(3)
    })
  })
})
