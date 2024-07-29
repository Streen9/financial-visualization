const IndexSelector = ({ selectedIndex, onIndexChange }) => {
  return (
    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button
        type="button"
        className={`px-4 py-2 text-sm font-medium border rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 
        ${
          selectedIndex === "NIFTY200"
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        } border-gray-200 dark:border-gray-600`}
        onClick={() => onIndexChange("NIFTY200")}
      >
        NIFTY200
      </button>
      <button
        type="button"
        className={`px-4 py-2 text-sm font-medium border-t border-b focus:z-10 focus:ring-2 focus:ring-blue-500 
        ${
          selectedIndex === "NIFTY500"
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        } border-gray-200 dark:border-gray-600`}
        onClick={() => onIndexChange("NIFTY500")}
      >
        NIFTY500
      </button>
    </div>
  );
};

export default IndexSelector;
