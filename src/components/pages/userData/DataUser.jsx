import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../../fireBaseConfig";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const DataUser = () => {
  const [myDataUser, setMyDataUser] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const userCollection = collection(db, "users");
      const userRef = doc(userCollection, user.id);

      getDoc(userRef).then((res) => {
        if (res.exists()) {
          setMyDataUser(res.data());
        } else {
          console.log("El documento no existe");
        }
      });
    }
  }, [user]);

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Nombre</TableCell>
              <TableCell align="left">Apellido</TableCell>
              <TableCell align="center">Telefono</TableCell>
              <TableCell align="left">Codigo postal</TableCell>              
              <TableCell align="center">Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              key={0}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row" align="left">
                {myDataUser.name}
              </TableCell>
              <TableCell component="th" scope="row" align="left">
                {myDataUser.lastname}
              </TableCell>
              <TableCell component="th" scope="row" align="center">
                {myDataUser.phone}
              </TableCell>
              <TableCell component="th" scope="row" align="center">
                {myDataUser.postalCode}
              </TableCell>
              <TableCell component="th" scope="row" align="center">
                {user.email}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DataUser;
