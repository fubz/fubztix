import { Ticket } from '../ticket'

it('implements optimistic concurrency control', async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'testtix',
    price: 5,
    userId: 'abc123',
  })
  await ticket.save()

  // Save the ticket to the database
  const firstInstance = await Ticket.findById(ticket.id)
  // fetch the ticket twice
  const secondInstance = await Ticket.findById(ticket.id)

  // make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 1337 })
  secondInstance!.set({ price: 100000 })

  // save the first fetched ticket
  await firstInstance!.save()

  // save the second fetched ticket
  // expect to fail because the version number is out of date
  await expect(secondInstance!.save()).rejects.toThrow(
    'No matching document found for id'
  )
  done()

  // The SG Way:
  // try {
  //   await secondInstance!.save()
  // } catch (err) {
  //   return done()
  // }
  //
  // throw new Error('Should not reach this point')
})

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'tixpix',
    price: 10,
    userId: 'weeeeeee',
  })

  await ticket.save()
  expect(ticket.version).toEqual(0)

  await ticket.save()
  expect(ticket.version).toEqual(1)

  await ticket.save()
  expect(ticket.version).toEqual(2)
})
