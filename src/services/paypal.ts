import axios from "axios";
import { Product } from "../payloads/Product";
import { Payer } from "../payloads/Payer";

export async function authenticate() {
  const { data: { access_token } } = await axios.post(
    'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    'grant_type=client_credentials',
    {
      auth: {
        username: process.env.CLIENT_ID ?? "",
        password: process.env.APP_SECRET ?? "",
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return access_token;
}

interface CreateOrderProps {
  token: string
  order: {
    products: Product[];
    payer: Payer
  }
}

export async function createOrder({ token, order }: CreateOrderProps) {
  const { data } = await axios.post("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
    intent: "CAPTURE",
    payer: {
      name :{
         given_name: order.payer.first_name,
         surname: order.payer.last_name
      },
      email_address: order.payer.email,
      address:{
         address_line_1: order.payer.address,
         admin_area_1: order.payer.state.split('-')[0].trim(),
         admin_area_2: order.payer.state.split('-')[1].trim(),
         postal_code: order.payer.zip,
         country_code: order.payer.country
      }
   },
    purchase_units: [{
      amount: {
        currency_code: "BRL",
        value: order.products.reduce((acc, product) => acc + parseInt(product.price), 0).toString()
      },
    }]
  }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  return data;
}

export async function capturePayment(token: string, orderId: string) {
  const { data } = await axios.post(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {}, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  return data;
}