import { useContext, useEffect, useState } from "react";
import { db } from "../../../fireBaseConfig";
import { getDocs, collection } from "firebase/firestore";

import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { CartContext } from "../../../context/CartContext";


const ItemListContainer = () => {
  const [products, setProducts] = useState([]);

  const { getFormatCurrency } = useContext(CartContext);

  useEffect(() => {
    let refCollection = collection(db, "products");
    getDocs(refCollection)
      .then((res) => {
        let productsList = res.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        });

        setProducts(productsList);
      })
      .catch((error) => console.log(error));
  }, []);

  

  return (
    <>
      <Paper elevation={3} sx={{ padding: "20px", textAlign: "center", mb: 3 }}>
        <Typography variant="h2" component="h3">
          Tienda
        </Typography>
      </Paper>

      <Grid container spacing={3} justifyContent="center">
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ maxWidth: 345 }}>
              <Link to={`/itemDetail/${product.id}`}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="140"
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
              </Link>
              <CardActions>
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
                {/* <IconButton aria-label="add to favorites">
                  <AddShoppingCartIcon />
                </IconButton> */}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default ItemListContainer;
