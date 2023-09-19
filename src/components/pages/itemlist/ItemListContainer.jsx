import { useEffect, useState } from "react";
import { db } from "../../../fireBaseConfig";
import { getDocs, collection } from "firebase/firestore";

import { Link } from "react-router-dom";

const ItemListContainer = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {

    
      let refCollection = collection(db, "products");
      getDocs(refCollection)

      .then((res) => {

      let productsList = res.docs.map((doc) => {
        return {...doc.data(), id: doc.id };
      });

      setProducts(productsList)
    })
    .catch((error) => console.log(error));    
  }, []);

  return (
    <>
      <h1>Esta es mi Tienda</h1>

      {products.map((product) => {
        return (
          <div key={product.id} style={{ border: "2px solid black" }}>
            <Link to={`/itemDetail/${product.id}`}>
              <img src={product.image} style={{ width: "300px" }} alt="" />
            </Link>
            <h3>Artículo: {product.title}</h3>
            <h3>Precio: {product.unit_price}</h3>
          </div>
        );
      })}
    </>
  );
};

export default ItemListContainer;
