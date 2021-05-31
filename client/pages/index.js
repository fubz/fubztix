import Link from 'next/link'

const IndexPage = ({ currentUser, tickets }) => {
  return (
    <div>
      <h2>Tickets</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <TicketList tickets={tickets} />
        </tbody>
      </table>
    </div>
  )
}

const TicketList = ({ tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>Details</a>
          </Link>
        </td>
      </tr>
    )
  })

  return ticketList
}

// During SSR these will fill in props of the component for it's single render
IndexPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets')

  return { tickets: data }
}

export default IndexPage
