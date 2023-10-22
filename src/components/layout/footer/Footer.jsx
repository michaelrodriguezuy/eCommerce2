import { Box, Toolbar, Tooltip } from "@mui/material";
import { Link } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import { Outlet } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <Outlet />
      <Box
        component="footer"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#1976d2",
          color: "whitesmoke",
          padding: "5px",
          width: "100%",
          position: "fixed",
          bottom: "0",
          left: 0,                   
        }}
      >
        <p>© 2023 Tu Empresa. Todos los derechos reservados.</p>

        <Toolbar
          sx={{
            gap: "20px",
            display: "flex",
            flexDirection: "row",
            alignContent: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "40px",
              justifyContent: "space-between",
            }}
          >
            <Link
              href="https://api.whatsapp.com/send?phone=59899163200&text=Hola%20Michael"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "whitesmoke", textDecoration: "none" }}
            >
              <Tooltip title="Enviame un whatsapp">
                <WhatsAppIcon sx={{ color: "whitesmoke" }} />
              </Tooltip>
            </Link>
            <Link
              href="https://www.instagram.com/michael_r.33/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "whitesmoke", textDecoration: "none" }}
            >
              <Tooltip title="Contactame por instagram">
                <InstagramIcon sx={{ color: "whitesmoke" }} />
              </Tooltip>
            </Link>
          </Box>
        </Toolbar>
      </Box>
    </>
  );
};

export default Footer;
