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
import { Pagination } from "@mui/material";

const ItemListContainer = () => {
  const [products, setProducts] = useState([]);
  const { getFormatCurrency } = useContext(CartContext);
  const itemsPerPage = 9;
  const pageCount = Math.ceil(products.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(0);

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

  const displayedProducts = products.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <>
      <Paper elevation={3} sx={{ padding: "20px", textAlign: "center", mb: 3 }}>
        <Typography variant="h2" component="h3">
          Tienda
        </Typography>
      </Paper>

      <Grid container spacing={3} justifyContent="center" sx={{ marginX: -2 }}>
        {displayedProducts.map((product) => (
          <Grid
            item
            key={product.id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            sx={{
              marginX: 2,
              mb: 4,              
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Card sx={{ width: 300 }}>
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
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Pagination
        count={pageCount}
        page={currentPage + 1}
        onChange={(event, page) => setCurrentPage(page - 1)}
        shape="rounded"
        showFirstButton
        showLastButton
        color="primary"
        size="large"
        variant="outlined"
        boundaryCount={2}
        siblingCount={0}
        disabled={pageCount === 1}
        sx={{ marginTop: 3, display: "flex", justifyContent: "center" }}
      />
    </>
  );
};

export default ItemListContainer;
