import { Button, LinearProgress, MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import { db, uploadFile } from "../../../fireBaseConfig";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";

const ProductsForm = ({
  handleClose,
  setIsChange,
  productSelected,
  setProductSelected,
  categories,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [newProduct, setNewProduct] = useState({
    code: "",
    title: "",
    description: "",
    unit_price: 0,
    stock: 0,
    category: "",
    image: "",
  });
  const [file, setFile] = useState(null);

  const handleImage = async () => {
    setIsLoading(true);

    try {
      let url = await uploadFile(file, (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      });

      if (productSelected) {
        setProductSelected({ ...productSelected, image: url });
      } else {
        setNewProduct({ ...newProduct, image: url });
      }

      setIsLoading(false); //aca se muestra nuevamente el boton de submit
    } catch (error) {
      console.error("Error al cargar la imagen:", error);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    if (productSelected) {
      setProductSelected({
        ...productSelected,
        [e.target.name]: e.target.value,
      });
    } else {
      setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const productsCollection = collection(db, "products");

    if (productSelected) {
      let obj = {
        ...productSelected,
        unit_price: +productSelected.unit_price,
        stock: +productSelected.stock,
      };
      updateDoc(doc(productsCollection, productSelected.id), obj).then(() => {
        setIsChange(true);
        handleClose();
      });
    } else {
      let obj = {
        ...newProduct,
        unit_price: +newProduct.unit_price,
        stock: +newProduct.stock,
      };
      addDoc(productsCollection, obj).then(() => {
        setIsChange(true);
        handleClose();
      });
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <TextField
          variant="outlined"
          defaultValue={productSelected?.code}
          label="código"
          name="code"
          onChange={handleChange}
        />
        <TextField
          variant="outlined"
          defaultValue={productSelected?.title}
          label="titulo"
          name="title"
          onChange={handleChange}
        />
        <TextField
          variant="outlined"
          defaultValue={productSelected?.description}
          label="descripción"
          name="description"
          onChange={handleChange}
        />
        <TextField
          variant="outlined"
          defaultValue={productSelected?.unit_price}
          label="precio"
          name="unit_price"
          onChange={handleChange}
        />
        <TextField
          variant="outlined"
          defaultValue={productSelected?.stock}
          label="stock"
          name="stock"
          onChange={handleChange}
        />
        <TextField
          variant="outlined"
          defaultValue={productSelected?.category}
          label="Categoría"
          name="category"
          select
          onChange={handleChange}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.name}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField type="file" onChange={(e) => setFile(e.target.files[0])} />
        {file && (
          <div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button onClick={handleImage} type="button" disabled={!isLoading}>
                Cargar imagen
              </Button>
            </div>
            <div>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ marginBottom: "10px" }}
              />
            </div>
          </div>
        )}

        {file && !isLoading && (
          <Button
            variant="contained"
            type="submit"
            style={{ display: "flex", justifyContent: "center" }}
          >
            {productSelected ? "modificar" : "crear"}
          </Button>
        )}
      </form>
    </div>
  );
};

export default ProductsForm;
