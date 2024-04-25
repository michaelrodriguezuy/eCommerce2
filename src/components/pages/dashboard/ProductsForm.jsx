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
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  const [newProduct, setNewProduct] = useState({
    code: "",
    title: "",
    description: "",
    unit_price: 0,
    stock: 0,
    color: "",
    category: "",
    image: [],
  });

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    const filesArray = Array.from(selectedFiles);
    setFiles(filesArray);
  };

  const handleImage = async () => {
    console.log("cargando imagenes");
    setIsLoading(true);
  
    try {
      const urls = await Promise.all(

        Array.from(files).map(async (file) => {
          console.log("cargando imagen dentro del array");
          const url = await uploadFile(file, (progress) => {
            setUploadProgress(progress);
          });
          console.log("url cargada", url);
          return url;
        })
      );

      setImageUrls(prevUrls => [...prevUrls, ...urls]);
      
      setIsLoading(false);
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
      console.log("newProduct", newProduct);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const productsCollection = collection(db, "products");

    if (productSelected) {
      console.log("productSelected", productSelected);
      let obj = {
        ...productSelected,
        unit_price: +productSelected.unit_price,
        stock: +productSelected.stock,
        color: productSelected.color,
        image: imageUrls,
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
        color:newProduct.color,
        image: imageUrls,
      };
      console.log("obj", obj);
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
          defaultValue={productSelected?.color}
          label="color"
          name="color"
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
        <TextField type="file" onChange={handleFileChange} multiple />
        {files.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button onClick={handleImage} type="button" disabled={isLoading}>
                Cargar imágenes
              </Button>
            </div>
            <div>
              {isLoading && (
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ marginBottom: "10px" }}
                />
              )}
            </div>
          </div>
        )}

        {files && !isLoading && uploadProgress === 100 && (
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
