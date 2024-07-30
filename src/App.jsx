import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import D3Treemap from "./components/D3Treemap";
import { fetchLatestFileFromS3 } from "./services/s3service";
import useStore from "./store/useFilterStore";
import TreeMap from "./components/TreemapEchart";
import IndexSelector from "./components/IndexSelector";

const drawerWidth = 240;

const Sidebar = ({
  selectedIndex,
  onIndexChange,
  darkMode,
  setDarkMode,
  currentPage,
  onPageChange,
}) => (
  <Box
    sx={{
      p: 3,
      bgcolor: darkMode ? "grey.900" : "grey.100",
      color: darkMode ? "grey.100" : "grey.900",
      height: "100vh",
      boxShadow: 3,
    }}
  >
    <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
      Dashboard
    </Typography>
    <FormControlLabel
      control={
        <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
      }
      label={darkMode ? "Light Mode" : "Dark Mode"}
      sx={{ mb: 2 }}
    />
    <FormControlLabel
      control={
        <Switch checked={currentPage === "D3Treemap"} onChange={onPageChange} />
      }
      label={
        currentPage === "TreeMapEchart"
          ? "Switch to D3Treemap"
          : "Switch to TreeMapEchart"
      }
      sx={{ mb: 2 }}
    />
    <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "medium" }}>
      Select Index
    </Typography>
    <IndexSelector
      selectedIndex={selectedIndex}
      onIndexChange={onIndexChange}
      sx={{ mt: 1 }}
    />
  </Box>
);

function App() {
  const { currentPage, setCurrentPage } = useStore();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState("NIFTY500");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataFetch = await fetchLatestFileFromS3(selectedIndex);
        setData(dataFetch);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [selectedIndex]);

  const handlePageChange = () => {
    setCurrentPage(
      currentPage === "TreeMapEchart" ? "D3Treemap" : "TreeMapEchart"
    );
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Sidebar
      selectedIndex={selectedIndex}
      onIndexChange={setSelectedIndex}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      currentPage={currentPage}
      onPageChange={handlePageChange}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          <Box sx={{ height: "calc(100vh - 88px)" }}>
            {currentPage === "TreeMapEchart" ? (
              <TreeMap data={data} />
            ) : (
              <D3Treemap data={data} error={error} darkMode={darkMode} />
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

Sidebar.propTypes = {
  selectedIndex: PropTypes.string.isRequired,
  onIndexChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  setDarkMode: PropTypes.func.isRequired,
  currentPage: PropTypes.string.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default App;
