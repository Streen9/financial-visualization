import { useState, useEffect } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";
import D3Treemap from "./components/D3Treemap";
import { fetchLatestFileFromS3 } from "./services/s3service";
import useStore from "./store/useFilterStore";
import TreeMap from "./components/TreemapEchart";
import IndexSelector from "./components/IndexSelector";

const Sidebar = ({ isOpen, setIsOpen, selectedIndex, onIndexChange, darkMode, setDarkMode, currentPage, onPageChange }) => (
  <>
    {/* Overlay */}
    {isOpen && (
      <div
        className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
        onClick={() => setIsOpen(false)}
      ></div>
    )}

    {/* Sidebar */}
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 overflow-y-auto transition duration-300 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex items-center justify-between h-20 px-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 mr-2"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden"
          >
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
      <nav className="mt-5 px-4">
        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={currentPage === "D3Treemap"}
              onChange={onPageChange}
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {currentPage === "TreeMapEchart"
                ? "Switch to D3Treemap"
                : "Switch to TreeMapEchart"}
            </span>
          </label>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Select Index
          </h2>
          <IndexSelector
            selectedIndex={selectedIndex}
            onIndexChange={onIndexChange}
          />
        </div>
        {/* Add your other sidebar navigation items here */}
      </nav>
    </div>
  </>
);

const Layout = ({
  children,
  selectedIndex,
  onIndexChange,
  currentPage,
  onPageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        selectedIndex={selectedIndex}
        onIndexChange={onIndexChange}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-20 lg:hidden text-gray-500 dark:text-gray-200 focus:outline-none"
        >
          <Menu size={24} />
        </button>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 dark:bg-gray-700">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const { currentPage, setCurrentPage } = useStore();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState("NIFTY500");

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

  return (
    <Layout
      selectedIndex={selectedIndex}
      onIndexChange={setSelectedIndex}
      currentPage={currentPage}
      onPageChange={handlePageChange}
    >
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
        {currentPage === "TreeMapEchart" ? (
          <TreeMap data={data} />
        ) : (
          <D3Treemap data={data} error={error} />
        )}
      </div>
    </Layout>
  );
}

export default App;