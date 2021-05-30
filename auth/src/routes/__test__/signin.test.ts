import request from 'supertest'
import { app } from '../../app'

it('fails when when a email does not match user account', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400)
})

it('fails when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'areallongpassword',
    })
    .expect(201)

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'notthepassword',
    })
    .expect(400)
})

it('user can signin and get a jwt cookie', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'areallongpassword',
    })
    .expect(201)

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'areallongpassword',
    })
    .expect(200)

  expect(response.get('Set-Cookie')).toBeDefined()
})
