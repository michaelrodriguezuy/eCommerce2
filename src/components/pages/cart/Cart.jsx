import { useContext } from "react";
import { CartContext } from "../../../context/CartContext";
import { Link } from "react-router-dom";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import PaidIcon from "@mui/icons-material/Paid";
import Swal from "sweetalert2";

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

const Cart = () => {
  const { cart, clearCart, deleteById, getTotalPrice, getFormatCurrency } =
    useContext(CartContext);

  let total = getTotalPrice();

  const handlerClearCart = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Se vaciará el carrito de compras",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, vaciar",
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
        Swal.fire("Vacío", "El carrito de compras se vació", "success");
      }
    });
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          justifyContent: "space-around",
          padding: "20px",
          textAlign: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h4">
          Mi compra
        </Typography>
        <Tooltip title="Vaciar carrito">
          <IconButton onClick={handlerClearCart}>
            <RemoveShoppingCartIcon color="primary" />
          </IconButton>
        </Tooltip>
      </Paper>

      <TableContainer
        component={Paper}
        style={{ marginTop: "30px", marginBottom: "50px" }}
      >
        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <Table sx={{ minWidth: 650 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">Arículo</StyledTableCell>
                  <StyledTableCell align="center">
                    Precio unitario
                  </StyledTableCell>
                  <StyledTableCell align="center">Cantidad</StyledTableCell>
                  <StyledTableCell align="center">Subtotal</StyledTableCell>
                  <StyledTableCell align="center">Editar</StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {cart.map((product) => {
                  return (
                    <StyledTableRow key={product.id}>
                      <StyledTableCell
                        component="th"
                        scope="row"
                        align="center"
                      >
                        {product.title}
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        {getFormatCurrency(product.unit_price)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {product.quantity}
                      </StyledTableCell>

                      {/* calculo el subtotal del articulo  */}
                      <StyledTableCell align="center">
                        {getFormatCurrency(
                          product.unit_price * product.quantity
                        )}
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        <IconButton onClick={() => deleteById(product.id)}>
                          <Tooltip title="Eliminar item">
                            <DeleteForeverIcon color="primary" />
                          </Tooltip>
                        </IconButton>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TableContainer>

      <Paper
        elevation={3}
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "20px",
          textAlign: "center",
          mb: 3,
        }}
      >
        <Typography variant="h3" component="h3">
          Total: {getFormatCurrency(total)}
        </Typography>

        {cart.length > 0 && (
          <Link to="/checkout" style={{ color: "steelblue" }}>
            <IconButton>
              <Tooltip title="PAGAR">
                <PaidIcon color="primary" style={{ fontSize: 60 }} />
              </Tooltip>
            </IconButton>
          </Link>
        )}
      </Paper>
    </>
  );
};

export default Cart;
