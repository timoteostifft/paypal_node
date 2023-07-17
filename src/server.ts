import { config } from 'dotenv';
import express, { Request, Response } from "express";
import * as paypal from "./services/paypal";
import cors from "cors";

config();

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;

app.get('/auth/', async (request: Request, response: Response) => {
  try {
    const access_token = await paypal.authenticate();
    response.json({access_token});
  } catch (err) {
    response.status(400).send('Error.');
  }
})

app.post('/create-order', async (request: Request, response: Response) => {
  try {
    const token = await paypal.authenticate();

    const order = await paypal.createOrder({token, order: request.body});

    return response.json(order);
  } catch (err) {
    response.status(500).send(err.message);
  }
})

app.post('/capture-order', async(request: Request, response: Response) => {
  try {
    const token = await paypal.authenticate();
    const { orderID } = request.body;

    const capturedData = await paypal.capturePayment(token, orderID);
    response.json(capturedData)
  } catch(err) {
    response.status(500).send(err.message);
  }
})

app.listen(port, () => console.log(`Server is running on port ${port}`))