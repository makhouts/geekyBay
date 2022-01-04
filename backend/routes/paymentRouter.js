if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}
import express from "express";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";
import pool from "../helper/dbConnection.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post("/payment", (req, res) => {
  const { product, token } = req.body;
  //   console.log("product", product.products);
  //   console.log("token", token);
  const prods = [];
  let amount = 0;

  product.products.forEach((p) => {
    prods.push({ id: p.id, qty: p.qty });
  });

  let query = "SELECT * FROM products WHERE productID IN (";
  prods.forEach((p) => {
    query += `${p.id},`;
  });
  query = query.substring(0, query.length - 1) + ")";

  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(query, (err, products) => {
      connection.release();
      if (!err) {
        products.forEach((p, i) => {
          amount += p.price * prods[i].qty;
        });
      } else {
        res.status(400).send("Bad request");
      }
    });
  });

  const idempotencyKey = uuidv4();
  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create({
          amount: amount * 100,
          currency: 'eur',
          customer: customer.id,
          receipt_email: token.email,
          description: product.name // TODO: add info from req.user maybe
      }, { idempotencyKey });
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => console.log(err));
});

export default router;
