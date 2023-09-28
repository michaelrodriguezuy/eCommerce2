import HomeIcon from '@mui/icons-material/Home';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ShopIcon from '@mui/icons-material/Shop';
import ContactPageIcon from '@mui/icons-material/ContactPage';

import categories from "./categories";

export const menuItems = [    
   
    {
        id: "home",
        path: "/",
        title: "Inicio",
        Icon: HomeIcon
    },
    {
        id: "products",
        path: "/shop",
        title: "Tienda",
        Icon: StoreIcon,
        subMenuItems: categories.map(category => ({
            id: category.id,
            path: `/shop/${category.id}`,
            title: category.title
        }))
    },
    {
        id: "cart",
        path: "/cart",
        title: "Carrito",
        Icon: ShoppingCartCheckoutIcon
    },
    {
        id: "dataUser",
        path: "/data-user",
        title: "Mis datos",
        Icon: ContactPageIcon
    },
    {
        id: "userOrders",
        path: "/user-orders",
        title: "Mis compras",
        Icon: ShopIcon
    }
]