import { useContext } from "react";
import { CartContext } from "../../../context/CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cart, clearCart, deleteById, getTotalPrice } =
    useContext(CartContext);

  let total = getTotalPrice();

  return (
    <>
      <h1>Aqui esta tu carrito</h1>
      { cart.length > 0 &&
        <Link to="/checkout" style={{ color: "steelblue" }}>
        Finalizar compra
      </Link>
      }
      {cart.map((product) => {
        return (
          <div key={product.id} style={{ border: "2px solid black" }}>
            <h3>Artículo: {product.title}</h3>
            <h4>${product.unit_price}</h4>
            <h4>Cantidad: {product.quantity}</h4>
            <button onClick={() => deleteById(product.id)}>Eliminar</button>
          </div>
        );
      })}
      <h2>Total: ${total}</h2>
      <button onClick={clearCart}>Limpiar carrito</button>
    </>
  );
};

export default Cart;
