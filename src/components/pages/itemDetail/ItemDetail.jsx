import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../fireBaseConfig";
import { collection, getDoc, doc } from "firebase/firestore";
import { Button } from "@mui/material";
import { CartContext } from "../../../context/CartContext";

const ItemDetail = () => {
  const { id } = useParams();
  const { addItem, getQuantityById} = useContext(CartContext);
  let quantity = getQuantityById(id);
  const [product, setProduct] = useState(null);
  const [contador, setContador] = useState(quantity || 1);


  useEffect(() => {
    const getProduct = async () => {
      let refCollection = collection(db, "products");
      let refDoc = doc(refCollection, id);

      const productSnapshot = await getDoc(refDoc);

      setProduct({
        id: productSnapshot.id,
        ...productSnapshot.data(),
      });
    };
    getProduct();
  }, [id]);

  const sumar = () => {
    if (contador < product.stock) {
      setContador(contador + 1);
    } else {
        alert("No hay más stock");
    }
  };

  const restar = () => {
    if (contador <= product.stock && contador > 1) {
    setContador(contador - 1);    
  } else {
    alert("Al menos debes agregar 1 artículo");
  }
};

const agregarAlCarrito = () => {
    let producto = {
        ...product,
        quantity: contador
    }
    addItem(producto);
}

  return (
    <>
      <h1>Detalle del artículo</h1>
      {product && (
        <div key={product.id}>
          <img src={product.image} style={{ width: "300px" }} alt="" />
          <h3>Artículo: {product.title}</h3>
          <h3>Precio: {product.unit_price}</h3>
          <h3>Stock: {product.stock}</h3>
        </div>
      )}

{quantity && <h6> Ya tienes {quantity} en el carrito </h6> }
{product?.stock === quantity && <h6> Ya tienes el maximo en el carrito </h6>}

      <div style={{ display: "flex" }}>
        <Button variant="contained" onClick={restar}>
          -
        </Button>
        <h2>{contador}</h2>
        <Button variant="contained" onClick={sumar}>
          +
        </Button>
        
        <Button variant="outlined" onClick={agregarAlCarrito}>
            Agregar al carrito
        </Button>
      </div>
    </>
  );
};

export default ItemDetail;
