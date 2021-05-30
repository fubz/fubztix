import { useEffect, useState } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/useRequest'
import Router from 'next/router'

const orderShow = ({ order, email }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  })

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date()
      setTimeLeft(Math.round(msLeft / 1000))
    }

    findTimeLeft()
    const timerId = setInterval(findTimeLeft, 1000)

    return () => {
      clearInterval(timerId)
    }
  }, [order])

  if (timeLeft < 0) {
    return <div>Order Expired</div>
  }

  return (
    <div>
      <span>{timeLeft} seconds until order expires</span>
      <br />
      <StripeCheckout
        token={(token) => doRequest({ token: token.id })}
        stripeKey="pk_test_51Iw7IDHqcinlpz7slXjgW0oec232KArHfTQ3Qf3OD4OMtGTv33slCwc0McvwcfyFb0RV6EBEPl86aPmcKxdv26gZ00kaTP2ooe"
        amount={order.ticket.price * 100}
        email={email}
      />
      {errors}
    </div>
  )
}

orderShow.getInitialProps = async (context, client, currentUser) => {
  const { orderId } = context.query
  const { data } = await client.get(`/api/orders/${orderId}`)

  return { order: data, email: currentUser.email }
}

export default orderShow
