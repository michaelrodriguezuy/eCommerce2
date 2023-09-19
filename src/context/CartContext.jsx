import { createContext, useState } from "react";

export const CartContext = createContext();

const CartContextComponent = ({ children }) => {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const addItem = (product) => {
    let existe = cart.some((elemento) => elemento.id === product.id);

    if (existe) {
      let nuevoCart = cart.map((elemento) => {
        if (elemento.id === product.id) {
          return { ...elemento, quantity: product.quantity };
        } else {
          return elemento;
        }
      });
      localStorage.setItem("cart", JSON.stringify(nuevoCart));
      setCart(nuevoCart);
    } else {
      localStorage.setItem("cart", JSON.stringify([...cart, product]));
      setCart([...cart, product]);
    }
  };

  const getQuantityById = (id) => {
    let product = cart.find((elemento) => elemento.id === id);
    return product?.quantity;
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const deleteById = (id) => {
    let nuevoCart = cart.filter((elemento) => elemento.id !== id);
    localStorage.setItem("cart", JSON.stringify(nuevoCart));
    setCart(nuevoCart);
  };

  const getTotalPrice = () => {
    let total = cart.reduce((acumulador, elemento) => {
      return acumulador + (elemento.unit_price * elemento.quantity);
    }, 0);
    return total;
  };

  let data = {
    cart,
    addItem,
    getQuantityById,
    clearCart,
    deleteById,
    getTotalPrice,
  };

  return <CartContext.Provider value={data}>{children}</CartContext.Provider>;
};

export default CartContextComponent;
