import { useContext, useEffect, useState } from "react";
import { CartContext } from "../../../context/CartContext";

import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import axios from "axios";
import { Button, TextField } from "@mui/material";
import { AuthContext } from "../../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { db } from "../../../fireBaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  initMercadoPago(import.meta.env.VITE_PUBLICKEY, {
    locale: "es-UY",
  });

  const [preferenceId, setPreferenceId] = useState(null);

  const [userData, setUserData] = useState({
    cp: "",
    phone: "",
  });

  const [orderId, setOrderId] = useState(null);
  const [shipmentCost, setShipmentCost] = useState(0);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paramValue = queryParams.get("status");

  console.log("1" + paramValue);

  useEffect(() => {
    let order = JSON.parse(localStorage.getItem("order"));
    if (paramValue === "approved") {
      let ordersCollection = collection(db, "orders");

      try {
        addDoc(ordersCollection, { ...order, date: serverTimestamp() }).then(
          (res) => {
            console.log("3" + res.id);

            setOrderId(res.id);
          }
        );

        order.items.forEach((elemento) => {
          updateDoc(doc(db, "products", elemento.id), {
            stock: elemento.stock - elemento.quantity,
          });
        });

        localStorage.removeItem("order");
        clearCart();
      } catch (error) {
        console.log(error);
      }
    }
    console.log("2" + paramValue);
  }, [paramValue]);

  useEffect(() => {
    let shipmentCollection = collection(db, "shipment");
    let shipmentDoc = doc(shipmentCollection, "cjaxH9wiCpdkqlPulOSa");
    getDoc(shipmentDoc)
      .then((res) => {
        setShipmentCost(res.data().cost);
      })
      .catch((error) => console.log(error));
  }, []);

  let total = getTotalPrice();

  const createPreference = async () => {
    const items = cart.map((product) => {
      return {
        title: product.title,
        unit_price: product.unit_price,
        quantity: product.quantity,
      };
    });

    try {
      let response = await axios.post(
        "https://e-commerce-personal-backend-q6f9ku4xl-michaelrodriguezuy.vercel.app/create_preference",
        {
          items: items,
          shipment_cost: shipmentCost,
        }
      );

      const { id } = response.data;

      return id;
    } catch (error) {
      console.log(error);
    }
  };

  const handlePayment = async () => {
    let order = {
      cp: userData.cp,
      phone: userData.phone,
      items: cart,
      total: total + shipmentCost,
      email: user.email,
    };
    localStorage.setItem("order", JSON.stringify(order));
    const id = await createPreference();
    if (id) {
      setPreferenceId(id);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      {!orderId ? (
        <>
          <TextField
            name="cp"
            variant="outlined"
            label="codigo postal"
            onChange={handleChange}
          />
          <TextField
            name="phone"
            variant="outlined"
            label="telefono"
            onChange={handleChange}
          />

          <Button onClick={handlePayment}>Seleccione metodo de pago</Button>
        </>
      ) : (
        <>
          <h4>El pago se realizo con exito</h4>
          <h2>Su numero de compra es {orderId}</h2>
          <Link to="/shop">Seguir comprando</Link>
        </>
      )}

      {preferenceId && (
        <Wallet initialization={{ preferenceId, redirectMode: "self" }} />
      )}
    </div>
  );
};
export default Checkout;
