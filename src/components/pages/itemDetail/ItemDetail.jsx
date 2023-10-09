import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../fireBaseConfig";
import { collection, getDoc, doc } from "firebase/firestore";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { CartContext } from "../../../context/CartContext";
import { ArrowBack } from "@mui/icons-material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Swal from "sweetalert2";

const ItemDetail = () => {
  const { id } = useParams();
  const { addItem, getQuantityById } = useContext(CartContext);
  let quantity = getQuantityById(id);
  const [product, setProduct] = useState(null);
  const [contador, setContador] = useState(quantity || 1);
  const {getFormatCurrency } = useContext(CartContext);

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

    //si en localStorage existe originalArticleId, lo elimino
    if (localStorage.getItem("originalArticleId")) {
      localStorage.removeItem("originalArticleId");
    }
  }, [id]);

  const sumar = () => {
    if (contador < product.stock) {
      setContador(contador + 1);
    } else {
      Swal.fire({
        icon: "warning", // Puedes usar 'info', 'warning', 'error', etc.
        title: "Artículo",
        text: "No hay más stock",
        confirmButtonText: "Ok",
      });
    }
  };

  const restar = () => {
    if (contador <= product.stock && contador > 1) {
      setContador(contador - 1);
    } else {
      Swal.fire({
        icon: "warning", // Puedes usar 'info', 'warning', 'error', etc.
        title: "Artículo",
        text: "Al menos debes agregar 1 artículo",
        confirmButtonText: "Ok",
      });
    }
  };

  const agregarAlCarrito = () => {
    let producto = {
      ...product,
      quantity: contador,
    };
    addItem(producto);

    let message = "";

    if (quantity) {
      message = `Ya tienes ${quantity} en el carrito`;
    }

    if (product?.stock === quantity) {
      message = "Ya tienes el máximo en el carrito";
    }

    Swal.fire({
      icon: "success", // Puedes usar 'info', 'warning', 'error', etc.
      title: "Producto agregado al carrito",
      text: message,
      confirmButtonText: "Ok",
    });
  };

  
  return (
    <>
      <Tooltip title="Volver atras">
        <ArrowBack
          onClick={() => window.history.back()}
          style={{
            cursor: "pointer",
            fontSize: "30px",
            marginLeft: "10px",
            marginTop: "10px",
          }}
        />
      </Tooltip>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          marginTop: "20px",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h6" component="h3">
          Revisalo, agregalo a tu carrito y pronto, es tuyo
        </Typography>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            width: "80%", // Ajusta este valor según tus necesidades
          }}
        >
          {/* <Grid
            container
            spacing={0}
            justifyContent="center"
            alignItems="center"
            width="100%"
          > */}
          {/* si producto existe y si stock>0 */}
          {product && (
            <Grid item key={product.id} xs={12} sm={8} md={6} lg={4}>
              <Card sx={{ maxWidth: 445 }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="280"
                    image={product.image}
                    alt={product.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {product.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>

                <CardActions
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 20px 20px 20px",
                  }}
                >
                  <Button
                    size="large"
                    color="primary"
                    sx={{
                      fontSize: "32px",
                      height: "40px",
                      textTransform: "none",
                      fontWeight: "bold",
                      fontFamily: "'Caveat', sans-serif",
                    }}
                  >
                    {getFormatCurrency(product.unit_price)}
                  </Button>
                  <Tooltip
                    title={
                      product.stock > 0 ? "Stock disponible" : "No hay stock"
                    }
                  >
                    <IconButton
                      aria-label="stock"
                      sx={{
                        fontSize: "32px",
                        height: "40px",
                        textTransform: "none",
                        fontWeight: "bold",
                        fontFamily: "'Caveat', sans-serif",
                      }}
                    >
                      stock: {product.stock}
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>

              {product.stock > 0 && (
                <Paper
                  elevation={3}
                  sx={{
                    padding: "20px",
                    textAlign: "center",
                    mb: 3,
                    width: "100%",
                    maxWidth: 445,
                  }}
                >
                  <IconButton aria-label="remove to cart" onClick={restar}>
                    <RemoveIcon />
                  </IconButton>

                  <Button
                    size="large"
                    color="primary"
                    sx={{
                      fontSize: "42px",
                      height: "40px",
                      textTransform: "none",
                      fontWeight: "bold",
                      fontFamily: "'Caveat', sans-serif",
                    }}
                  >
                    {contador}
                  </Button>

                  <IconButton aria-label="add to cart" onClick={sumar}>
                    <AddIcon />
                  </IconButton>
                  <Tooltip title="Agregar al carrito">
                    <IconButton
                      aria-label="add to cart"
                      onClick={agregarAlCarrito}
                    >
                      <AddShoppingCartIcon />
                    </IconButton>
                  </Tooltip>
                </Paper>
              )}
            </Grid>
          )}
        </div>
      </div>
    </>
  );
};

export default ItemDetail;
