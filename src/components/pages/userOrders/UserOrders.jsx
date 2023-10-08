import { useContext, useEffect, useState } from "react";
import { db } from "../../../fireBaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../../../context/AuthContext";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import { CartContext } from "../../../context/CartContext";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const UserOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { user } = useContext(AuthContext);

  const { getDateShort, getFormatCurrency } = useContext(CartContext);

  useEffect(() => {
    const ordersCollection = collection(db, "orders");
    let ordersFiltered = query(
      ordersCollection,
      where("email", "==", user.email)
    );

    // async y await
    getDocs(ordersFiltered)
      .then((res) => {
        const ordersList = res.docs.map((order) => {
          return { ...order.data(), id: order.id };
        });
        setMyOrders(ordersList);
      })
      .catch((error) => console.log(error));
  }, [user.email]);

  // function laFecha(date) {
  //   if (!date) {
  //     return "Fecha no disponible";
  //   }

  //   const laFecha =
  //     date instanceof Date
  //       ? date.toLocaleString("es-ES", {
  //           day: "2-digit",
  //           month: "2-digit",
  //           year: "numeric",
  //         })
  //       : date.toDate().toLocaleString("es-ES", {
  //           day: "2-digit",
  //           month: "2-digit",
  //           year: "numeric",
  //         });

  //   return laFecha;
  // }

  // const formatCurrency = (price) => {
  //   const formattedPrice = price.toLocaleString("es-UY", {
  //     style: "currency",
  //     currency: "UYU",
  //   });
  //   return formattedPrice;
  // };

  function caluclarSubtotal() {
    let subtotal = 0;
    myOrders.forEach((order) => {
      order.items.forEach((item) => {
        subtotal += item.unit_price * item.quantity;
      });
    });
    return subtotal;
  }

  return (
    <div>
      <Typography
        variant="h5"
        color="textPrimary"
        marginBottom="15px"
        align="center"
      >
        Mis ordenes de compra
      </Typography>

      {myOrders
        .sort((a, b) => b.date.toMillis() - a.date.toMillis())
        .map((order) => (
          <TableContainer
            key={order.id}
            component={Paper}
            style={{ marginTop: "30px", marginBottom: "50px" }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell colSpan={7}>
                    <Typography variant="h7">
                      Número de orden: {order.id}
                    </Typography>
                  </StyledTableCell>
                </TableRow>

                <TableRow>
                  <StyledTableCell align="left">Fecha</StyledTableCell>
                  <StyledTableCell align="center">Arículo</StyledTableCell>
                  <StyledTableCell align="center">Precio</StyledTableCell>
                  <StyledTableCell align="center">Cantidad</StyledTableCell>
                  <StyledTableCell align="center">SubTotal</StyledTableCell>
                  <StyledTableCell align="center">Envío</StyledTableCell>
                  <StyledTableCell align="center">Total</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <StyledTableRow key={order.id}>
                  <StyledTableCell component="th" scope="row">
                    <span style={{ fontWeight: "bold" }}>
                      {getDateShort(order.date)}
                    </span>
                  </StyledTableCell>
                  <StyledTableCell align="left"></StyledTableCell>
                  <StyledTableCell align="left"></StyledTableCell>
                  <StyledTableCell align="left"></StyledTableCell>
                  <StyledTableCell align="center"></StyledTableCell>
                  <StyledTableCell align="center"></StyledTableCell>
                  <StyledTableCell align="center"></StyledTableCell>
                </StyledTableRow>
                {order?.items?.map((product) => (
                  <StyledTableRow key={product.id}>
                    <StyledTableCell align="left">{}</StyledTableCell>
                    <StyledTableCell component="th" scope="row" align="center">
                      {product.title}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {getFormatCurrency(product.unit_price)}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {product.quantity}
                    </StyledTableCell>
                    <StyledTableCell align="left">{}</StyledTableCell>
                    <StyledTableCell align="left">{}</StyledTableCell>
                    <StyledTableCell align="left">{}</StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
              <TableFooter
                colSpan={7}
                style={{ backgroundColor: "lightsteelblue" }}
              >
                <StyledTableRow key={order.id}>
                  <StyledTableCell align="left">{}</StyledTableCell>
                  <StyledTableCell align="left">{}</StyledTableCell>
                  <StyledTableCell align="left">{}</StyledTableCell>
                  <StyledTableCell align="left">{}</StyledTableCell>
                  <StyledTableCell align="center">
                    {getFormatCurrency(caluclarSubtotal())}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {getFormatCurrency(order.shipmentCost)}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <span style={{ fontWeight: "bold" }}>
                      {getFormatCurrency(order.total)}
                    </span>
                  </StyledTableCell>
                </StyledTableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        ))}
    </div>
  );
};

export default UserOrders;
