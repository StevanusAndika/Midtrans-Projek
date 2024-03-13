import React, { useState } from "react";
import { product } from "../libs/product";
import Link from "next/link";

const Checkout = () => {
  const [quantity, setQuantity] = useState(1);
  const [paymentUrl, setPaymentUrl] = useState("");

  const decreaseQuantity = () => {
    setQuantity((prevState) => (quantity > 1 ? prevState - 1 : 1));
  };

  const increaseQuantity = () => {
    setQuantity((prevState) => prevState + 1);
  };

  const checkout = async () => {
    const data = {
      id: product.id,
      productName: product.name,
      price: product.price,
      quantity: quantity
    };
    const response = await fetch("/api/tokenizer", {
      method: "POST",
      body: JSON.stringify(data)
    });
    const requestData = await response.json();
    window.snap.pay(requestData.token);
  };

  const generatePaymentLink = async () => {
    const secret = process.env.NEXT_PUBLIC_SECRET;
    const encodedSecret = Buffer.from(secret).toString('base64');
    const basicAuth = `Basic ${encodedSecret}`;
    
    const truncatedName = product.name.length > 50 ? product.name.substring(0, 50) : product.name;
    
    let requestData = {
      item_details: [
        {
          id: product.id,
          name: truncatedName,
          price: product.price,
          quantity: quantity
        }
      ],
      transaction_details: {
        order_id: product.id,
        gross_amount: product.price * quantity
      }
    };
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_API}/v1/payment-links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": basicAuth
      },
      body: JSON.stringify(requestData)
    });
  
    const payment = await response.json();
    setPaymentUrl(payment.payment_url);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex sm:gap-4">
          <button
            className="transition-all hover:opacity-75"
            onClick={decreaseQuantity}
          >
            ➖
          </button>

          <input
            type="number"
            id="quantity"
            value={quantity}
            className="h-10 w-16 text-black border-transparent text-center"
            onChange={(event) => setQuantity(parseInt(event.target.value))}
          />

          <button
            className="transition-all hover:opacity-75"
            onClick={increaseQuantity}
          >
            ➕
          </button>
        </div>
        <button
          className="rounded bg-indigo-500 p-4 text-sm font-medium transition hover:scale-105"
          onClick={checkout}
        >
          Checkout
        </button>
      </div>
      <button
        className="text-indigo-500 py-4 text-sm font-medium transition hover:scale-105"
        onClick={generatePaymentLink}
      >
        Create Payment Link
      </button>
      <div className="text-black underline italic hover:text-indigo-500">
        <Link href={paymentUrl} target="_blank">{paymentUrl}</Link>
      </div>
    </>
  );
};

export default Checkout;
