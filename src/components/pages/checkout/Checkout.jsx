import "./Checkout.css";

import { useContext, useEffect, useState } from "react";
import { CartContext } from "../../../context/CartContext";

import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import axios from "axios";

import {
  Button,
  TextField,
  FormControl,
  Grid,
  Typography,
  Paper,
  MenuItem,
  Select,
  TableCell,
  TableBody,
  TableRow,
  Table,
  TableHead,
  InputLabel,
  IconButton,
} from "@mui/material";

import { AuthContext } from "../../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { db } from "../../../fireBaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import confetti from "canvas-confetti";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StoreIcon from "@mui/icons-material/Store";

const Checkout = () => {
  const { cart, getTotalPrice, clearCart, getFormatCurrency } =
    useContext(CartContext);

  const { user } = useContext(AuthContext);

  const [preferenceId, setPreferenceId] = useState(null);

  const [orderId, setOrderId] = useState(null);

  const [shipmentOptions, setShipmentOptions] = useState([]);
  const [shipmentCost, setShipmentCost] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptionDescription, setSelectedOptionDescription] =
    useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paramValue = queryParams.get("status");

  const [cities, setCities] = useState([]);

  let initialValues = {
    cp: "",
    address: "",
    phone: "",
    city: "",
  };

  initMercadoPago(import.meta.env.VITE_PUBLICKEY, {
    locale: "es-UY",
  });

  // carga los tipos de envios
  useEffect(() => {
    let shipmentCollection = collection(db, "shipment");

    const fetchData = async () => {
      try {
        const res = await getDocs(shipmentCollection);
        const docData = res.docs.map((doc) => doc.data());

        const defaultOption = docData.length > 0 ? docData[0] : null;

        setShipmentOptions(docData);
        setSelectedOption(defaultOption);
      } catch (error) {
        console.log(error);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  // carga las ciudades
  useEffect(() => {
    let citiesCollection = collection(db, "cities");

    getDocs(citiesCollection)
      .then((res) => {
        const docData = res.docs.map((doc) => doc.data());

        const defaultOption = { id: "default", name: "Seleccione la ciudad" };
        const cities = [defaultOption, ...docData];
        setCities(cities);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    let order = JSON.parse(localStorage.getItem("order"));
    if (paramValue === "approved") {
      let ordersCollection = collection(db, "orders");
      console.log("paramValue " + paramValue);

      try {
        addDoc(ordersCollection, { ...order, date: serverTimestamp() }).then(
          (res) => {
            setOrderId(res.id);
          }
        );

        order.items.forEach((elemento) => {
          updateDoc(doc(db, "products", elemento.id), {
            stock: elemento.stock - elemento.quantity,
          });
        });

        localStorage.removeItem("order");
        clearCart();
      } catch (error) {
        console.log(error);
      }
    }
  }, [paramValue]);

  let total = getTotalPrice();

  const handlePayment = async () => {
    const selectedOption = shipmentOptions.find((opt) => opt.selected);

    if (!selectedOption) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Seleccioná cómo hacerte de tu compra",
      });
      return;
    }

    let order = {
      cp: formik.values.cp,
      address: formik.values.address,
      phone: formik.values.phone,
      city: formik.values.city,
      email: user.email,
      items: cart,
      shipmentOptions: selectedOption.name,
      shipmentCost: parseFloat(selectedOption.cost),
      total: getFormatCurrency(
        parseFloat(total) + parseFloat(selectedOption.cost)
      ),
    };

    localStorage.setItem("order", JSON.stringify(order));
    const id = await createPreference();
    if (id) {
      setPreferenceId(id);
    }
  };

  const handleShipmentOptionChange = (selectedOption) => {
    // Actualizar el estado de shipmentOptions y la opción seleccionada
    setShipmentOptions((prevOptions) => {
      const updatedOptions = prevOptions.map((opt) => ({
        ...opt,
        selected: opt.name === selectedOption.name,
      }));

      // Actualizar el estado de shipmentCost
      setShipmentCost(selectedOption.cost);
      setSelectedOption(selectedOption);
      setSelectedOptionDescription(selectedOption.description);

      return updatedOptions;
    });
  };

  useEffect(() => {
    if (shipmentOptions.length > 0) {
      const selectedOption = shipmentOptions.find((opt) => opt.selected);
      const cost = selectedOption ? selectedOption.cost : 0;
      setShipmentCost(cost);
    }
  }, [shipmentOptions]);

  const validationSchema = Yup.object({
    phone: Yup.number().required("Un número teléfonico es obligatorio"),
    city: Yup.string()
      .notOneOf([""], "Debe seleccionar una ciudad destino")
      .required("Debe seleccionar una ciudad destino"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handlePayment,
  });

  // const { isValid } = formik;
  const createPreference = async () => {
    const items = cart.map((product) => {
      return {
        title: product.title,
        unit_price: product.unit_price,
        quantity: product.quantity,
      };
    });

    console.log("Enviando solicitud al servidor...");
    // "https://ecommerce-back.uy/create_preference",
    // "http://localhost:8080/create_preference",

    try {
      let response = await axios.post(
        "https://backecommerce2.vercel.app/",
        {
          items: items,
          shipment_cost: parseFloat(shipmentCost),
          // shipment_options: "default",
        }
      );
      console.log("Respuesta del servidor:", response.data);

      const { id } = response.data;
      return id;
    } catch (error) {
      console.log("Error al enviar solicitud al servidor:", error);

      throw error;
    }
  };

  return (
    <div>
      {!orderId ? (
        <>
          <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  style={{ background: "#f0f0f0", padding: 8 }}
                >
                  <Typography variant="h7">
                    Usuario: {user.name} {user.lastname}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="phone"
                  variant="outlined"
                  label="Teléfono"
                  // onChange={handleChange}

                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="address"
                  variant="outlined"
                  label="Dirección"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.address}
                  error={
                    formik.touched.address && Boolean(formik.errors.address)
                  }
                  helperText={formik.touched.address && formik.errors.address}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="cp"
                  variant="outlined"
                  label="codigo postal"
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="city">Ciudad</InputLabel>
                  <Select
                    labelId="city"
                    id="city"
                    name="city"
                    variant="outlined"
                    // label="Ciudad"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.city}
                    error={formik.touched.city && Boolean(formik.errors.city)}
                    fullWidth
                    size="small"
                    style={{ marginTop: "20px" }}
                  >
                    {cities.map((city) => (
                      <MenuItem key={city.name} value={city.name}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  style={{ background: "#f0f0f0", padding: 8 }}
                >
                  <Typography variant="h7">Detalles de su compra</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  elevation={3}
                  sx={{
                    border: "1px solid #000",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          style={{
                            fontSize: "12px",
                            flex: "1",
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          Artículo
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: "12px",
                            flex: "1",
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          Costo unitario
                        </TableCell>

                        <TableCell
                          style={{
                            fontSize: "12px",
                            flex: "1",
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                          }}
                        >
                          Cantidad
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell
                            style={{
                              fontSize: "12px",
                              flex: "1",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            {item.title}
                          </TableCell>
                          <TableCell
                            style={{
                              fontSize: "12px",
                              flex: "1",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            ${item.unit_price}
                          </TableCell>
                          <TableCell
                            style={{
                              fontSize: "12px",
                              flex: "1",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            {item.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>
            <Typography variant="h6">
              Total compra: {getFormatCurrency(total)}
            </Typography>
          </Paper>

          <Paper
            elevation={3}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  style={{ background: "#f0f0f0", padding: 8 }}
                >
                  <Typography variant="h7">Forma de envío</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={0} style={{ padding: 8 }}>
                  <Grid
                    container
                    spacing={2}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {shipmentOptions &&
                      shipmentOptions.map((opt) => (
                        <Grid item key={opt.name}>
                          <IconButton
                            key={opt.name}
                            variant="outlined"
                            className={`${
                              opt.name === selectedOption?.name
                                ? "selected-button"
                                : "default-button"
                            }`}
                            onClick={() => handleShipmentOptionChange(opt)}
                          >
                            {opt.name === "Retiro en local" ? (
                              <StoreIcon style={{ marginRight: "4px" }} />
                            ) : opt.name === "Envío a domicilio" ? (
                              <LocalShippingIcon
                                style={{ marginRight: "4px" }}
                              />
                            ) : (
                              <></>
                            )}
                            {opt.name}
                          </IconButton>
                        </Grid>
                      ))}
                  </Grid>
                </Paper>
              </Grid>

              {selectedOption && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6">
                      Costo de envío:{" "}
                      {getFormatCurrency(parseFloat(shipmentCost))}
                    </Typography>
                  </Grid>

                  <Paper
                    elevation={1}
                    style={{
                      padding: 8,
                      textAlign: "center",
                      margin: "auto",
                      marginTop: 16,
                    }}
                  >
                    <Grid
                      item
                      xs={12}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle2">
                        {selectedOptionDescription}
                      </Typography>
                    </Grid>
                  </Paper>
                </>
              )}
            </Grid>
          </Paper>

          <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper elevation={0} style={{ padding: 8 }}>
                  <Typography
                    variant="h5"
                    style={{ color: "green", fontWeight: "bold" }}
                  >
                    Total a pagar:{" "}
                    {getFormatCurrency(
                      parseFloat(total) + parseFloat(shipmentCost)
                    )}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          <Button
            onClick={formik.handleSubmit}
            variant="contained"
            color="primary"
            fullWidth
            disabled={!formik.isValid || !formik.touched}
          >
            Seleccione método de pago
          </Button>
        </>
      ) : (
        <>
          {paramValue === "approved" ? (
            (console.log("orderId: " + orderId),
            (confetti({
              zindex: 999,
              particleCount: 100, //cantidad de papelitos
              spread: 70, //cuanto se esparcen
              origin: { y: 0.6 }, //desde donde salen
            }),
            (
              <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
                <Grid
                  container
                  spacing={2}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      style={{ padding: 8, textAlign: "center" }}
                    >
                      <Typography
                        variant="h5"
                        style={{ color: "green", fontWeight: "bold" }}
                      >
                        El pago se realizó con éxito
                      </Typography>
                    </Paper>
                    <Paper
                      elevation={0}
                      style={{ padding: 8, textAlign: "center" }}
                    >
                      Su código de compra es: {orderId}
                    </Paper>

                    <Button variant="outlined" color="primary" fullWidth>
                      <Link to="/shop">Seguir comprando</Link>
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )))
          ) : (
            <Typography
              variant="h5"
              style={{ color: "red", fontWeight: "bold" }}
            >
              Ocurrió algun inconveniente con tu compra, ponte en contacto y lo
              vamos a solucionar
            </Typography>
          )}
        </>
      )}

      {preferenceId && (
        <Wallet initialization={{ preferenceId, redirectMode: "self" }} />
      )}
    </div>
  );
};
export default Checkout;
