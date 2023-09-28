import { useEffect } from "react";
import { useState } from "react";
import { db } from "../../../fireBaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  addDoc,
  getDoc,
} from "firebase/firestore";
import ProductsList from "./ProductsList";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

import { MenuItem, Select } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [isChange, setIsChange] = useState(false);
  const [openModalShipment, setOpenModalShipment] = useState(false);
  const [shipmentCost, setShipmentCost] = useState(null);
  const [currentShipmentCost, setCurrentShipmentCost] = useState(null);

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openModalCategory, setOpenModalCategory] = useState(false);

  useEffect(() => {
    setIsChange(false);
    let prodcutsCollection = collection(db, "products");
    getDocs(prodcutsCollection).then((res) => {
      const newArr = res.docs.map((product) => {
        return {
          ...product.data(),
          id: product.id,
        };
      });
      setProducts(newArr);
    });
  }, [isChange]);

  const handleClose = () => {
    setOpenModalShipment(false);
  };

  useEffect(() => {
    const shipmentDocRef = doc(db, "shipment", "qSfk5z8oN9Lfdr89fWfY");
    getDoc(shipmentDocRef)
      .then((doc) => {
        if (doc.exists()) {
          const shipmentData = doc.data();
          setCurrentShipmentCost(shipmentData.cost);
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.error("Error al obtener el costo de envío:", error);
      });
  }, []);

  // tenemos 1 solo envio con costo
  const updateShipment = async () => {
    updateDoc(doc(db, "shipment", "qSfk5z8oN9Lfdr89fWfY"), {
      cost: shipmentCost,
    });
    setOpenModalShipment(false);
  };

  useEffect(() => {
    const categoriesCollection = collection(db, "categories");
    const q = query(categoriesCollection);
    getDocs(q).then((querySnapshot) => {
      const categoryList = [];
      querySnapshot.forEach((doc) => {
        categoryList.push({ id: doc.id, ...doc.data() });
      });
      setCategories(categoryList);
    });
  }, []);

  const updateCategory = async () => {
    try {
      if (selectedCategory) {
        const categoryDocRef = doc(db, "categories", selectedCategory);
        await updateDoc(categoryDocRef, {
          name: category,
        });

        const updatedCategories = categories.map((c) => {
          if (c.id === selectedCategory) {
            return { ...c, name: category };
          }
          return c;
        });

        setCategories(updatedCategories);
      } else {
        const categoryCollection = collection(db, "categories");
        const newCategoryRef = await addDoc(categoryCollection, {
          name: category,
        });

        setCategories((prevCategories) => [
          ...prevCategories,
          { id: newCategoryRef.id, name: category },
        ]);
      }

      setOpenModalCategory(false);
    } catch (error) {
      console.error("Error al actualizar/crear la categoría:", error);
    }
  };

  const handleCloseCategory = () => {
    setOpenModalCategory(false);

    setCategory("");
    setSelectedCategory(null);
  };

  return (
    <div>
      <Box style={{ display: "flex", justifyContent: "flex-end", gap: "5px" }}>
        <Button variant="contained" onClick={() => setOpenModalShipment(true)}>
          Costo de envio
        </Button>

        <Button variant="contained" onClick={() => setOpenModalCategory(true)}>
          Categorías
        </Button>
      </Box>

      <Modal
        open={openModalShipment}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...style, display: "flex", textAlign: "center" }}>
          <TextField
            label="Costo"
            value={
              shipmentCost !== null ? shipmentCost : currentShipmentCost || ""
            }
            onChange={(e) => setShipmentCost(+e.target.value)}
          />
          <Button onClick={updateShipment}>Modificar</Button>
        </Box>
      </Modal>

      <Modal
        open={openModalCategory}
        onClose={handleCloseCategory}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            ...style,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            textAlign: "center",
            gap: "20px",
          }}
        >
          <FormControl sx={{ marginTop: "20px" }}>
            <InputLabel>Selecciona una categoría</InputLabel>
            <Select
              value={selectedCategory || ""}
              onChange={(e) => {
                setSelectedCategory(e.target.value);

                const selectedCategoryName = categories.find(
                  (category) => category.id === e.target.value
                )?.name;
                setCategory(selectedCategoryName || "");
              }}
            >
              <MenuItem value="">
                <em>Creá una</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            <TextField
              label={
                selectedCategory ? "Modifca la categoría" : "Nueva categoría"
              }
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Typography>
          <Button onClick={updateCategory}>
            {selectedCategory ? "Modificar" : "Crear"}
          </Button>
        </Box>
      </Modal>

      <ProductsList
        products={products}
        categories={categories}
        setIsChange={setIsChange}
      />
    </div>
  );
};

export default Dashboard;
