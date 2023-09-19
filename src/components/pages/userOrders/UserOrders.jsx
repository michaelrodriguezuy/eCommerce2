import { useContext, useEffect, useState } from "react";
import { db } from "../../../fireBaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../../../context/AuthContext";

const UserOrders = () => {

    const [myOrders, setMyOrders] = useState([]);
    const {user} = useContext(AuthContext);

    useEffect(() => {
        const ordersCollection = collection(db, "orders");
        let ordersFiltered = query(ordersCollection, where("email", "==", user.email));
        
        // async y await
        getDocs(ordersFiltered).then((res) => {
            const ordersList = res.docs.map((order) => {
                return {...order.data(), id: order.id };
            });
            setMyOrders(ordersList);
        })
        .catch((error) => console.log(error)); 
    }, [user.email])

  return <div>
    <h1>Estas son mis compras</h1>
    {
        myOrders.map((order) => {
            return <div key={order.id} style={{border:"1px solid black"}}>
                {
                    order?.items?.map((product) => {
                        return <div key={product.id}>
                            <h3>Artículo: {product.title}</h3>
                            <h4>Precio: {product.unit_price}</h4>
                            <h4>Cantidad: {product.quantity}</h4>
                        </div>
                    })
                }
                <h4>Total: {order.total}</h4>                
            </div>
        })
    }
  </div>;
};

export default UserOrders;
