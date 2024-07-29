/* eslint-disable no-undef */
export const setColor = (changes, selectedOption) => {
  if (
    typeof changes !== "object" ||
    !Object.prototype.hasOwnProperty.call(changes, selectedOption)
  ) {
    return "#959595"; // Default color
  }

  const change = Number(`${changes[selectedOption]}`.replace("%", ""));
  if (change >= 2) {
    return "#019a11";
  } else if (change >= 1) {
    return "#35d24b";
  } else if (change >= -1) {
    return "#959595";
  } else if (change >= -2) {
    return "#FF4747";
  } else {
    return "#ff0000";
  }
};

const parseMarketCap = (value) => {
  if (typeof value !== "string") return 0;
  const units = { T: 1e12, B: 1e9, M: 1e6, K: 1e3 };
  const match = value.match(/([\d.]+)\s*([TBMK])/);
  if (match) {
    const number = parseFloat(match[1]);
    const unit = match[2];
    return number * (units[unit] || 1);
  }
  return parseFloat(value) || 0;
};

const formatShort = (value) => {
  if (value >= 1e12) {
    return (value / 1e12).toFixed(2) + "T";
  } else if (value >= 1e9) {
    return (value / 1e9).toFixed(2) + "B";
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(2) + "M";
  } else if (value >= 1e3) {
    return (value / 1e3).toFixed(2) + "K";
  } else {
    return value.toString();
  }
};

const formatNumberIndian = (num) => {
  if (isNaN(num)) return num;
  const x = num.toString().split(".");
  let x1 = x[0];
  const x2 = x.length > 1 ? "." + x[1] : "";
  let lastThree = x1.substring(x1.length - 3);
  const otherNumbers = x1.substring(0, x1.length - 3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formattedNumber =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + x2;
  return formattedNumber;
};

export const formatData = (data, setColorFunc, selectedOption) => {
  return data.map((item) => ({
    ...item,
    itemStyle: {
      color: setColorFunc(
        typeof item.changes === "object" ? item.changes : {},
        selectedOption
      ),
    },
    children: Array.isArray(item.children)
      ? formatData(item.children, setColorFunc, selectedOption)
      : [],
  }));
};

function getLevelOption() {
  return [
    {
      itemStyle: {
        borderColor: "#777",
        borderWidth: 0,
        gapWidth: 1,
      },
      upperLabel: {
        show: false,
      },
    },
    {
      itemStyle: {
        borderColor: "#555",
        borderWidth: 5,
        gapWidth: 1,
      },
      emphasis: {
        itemStyle: {
          borderColor: "#ddd",
        },
      },
    },
    {
      colorSaturation: [0.35, 0.5],
      itemStyle: {
        borderWidth: 0,
        gapWidth: 1,
        borderColorSaturation: 0.6,
      },
    },
  ];
}

export const getOption = (
  data,
  setColorFunc,
  formatDataFunc,
  selectedOption
) => {
  if (!data) {
    return;
  }
  if (!Array.isArray(data.children)) {
    throw new Error("Invalid data: 'children' is not an array");
  }

  const formattedData = formatDataFunc(
    data.children,
    setColorFunc,
    selectedOption
  );

  return {
    title: {
      text: "NIFTY Index TreeMap",
      left: "center",
    },
    tooltip: {
      enterable: true,
      offset: 25,
      formatter: function (params) {
        const fields = [
          "dividendYield",
          "totalRevenue",
          "debtToEquity",
          "volume",
          "marketCap",
          "priceToBook",
        ];
        let changes = {};
        let fieldValues = {};

        if (
          Array.isArray(params.data.children) &&
          params.data.children.length > 0
        ) {
          params.data.children.forEach((child) => {
            const childChanges = child.changes;
            const childFieldValues = fields.reduce((acc, field) => {
              let value;
              if (
                field === "marketCap" ||
                field === "volume" ||
                field === "totalRevenue"
              ) {
                value = parseMarketCap(child[field]);
              } else {
                value =
                  child[field] !== undefined && child[field] !== "NA"
                    ? Number(child[field])
                    : 0;
              }
              acc[field] = isNaN(value) ? 0 : value; // Ensure valid number
              return acc;
            }, {});

            for (const key in childChanges) {
              if (!changes[key]) {
                changes[key] = 0;
              }
              changes[key] += Number(childChanges[key]);
            }

            for (const field in childFieldValues) {
              if (!fieldValues[field]) {
                fieldValues[field] = 0;
              }
              fieldValues[field] += childFieldValues[field];
            }
          });
        } else {
          changes = params.data.changes;
          fieldValues = fields.reduce((acc, field) => {
            let value;
            if (
              field === "marketCap" ||
              field === "volume" ||
              field === "totalRevenue"
            ) {
              value = parseMarketCap(params.data[field]);
            } else {
              value =
                params.data[field] !== undefined && params.data[field] !== "NA"
                  ? Number(params.data[field])
                  : "-";
            }
            acc[field] = isNaN(value) ? "-" : value; // Ensure valid number
            return acc;
          }, {});
        }

        // Create a unique ID for the chart container
        const chartId = `chart_${params.dataIndex}`;

        // Load the Visualization API and the corechart package
        google.charts.load("current", { packages: ["corechart"] });

        // Set a callback to run when the Google Visualization API is loaded

        // Define the chart data
        const chartData = [
          ["Symbol", "Value"],
          ...params.data.children.map((child) => [child.symbol, child.value]),
        ];

        google.charts.setOnLoadCallback(drawChart);

        // Define the chart options
        const chartOptions = {
          title: `${params.data.name || "Child Data"}`,
          width: 400,
          height: 200,
          is3D: true,
        };
        function drawChart() {
          const data = google.visualization.arrayToDataTable(chartData);
          const chart = new google.visualization.LineChart(
            document.getElementById(chartId)
          );

          chart.draw(data, chartOptions);
        }
        const fieldDisplayNames = {
          dividendYield: "Dividend Yield",
          totalRevenue: "Total Revenue",
          debtToEquity: "Debt to Equity",
          volume: "Volume",
          marketCap: "Market Cap",
          priceToBook: "Price to Book",
        };

        let fieldTable =
          '<table style="width:100%;border-collapse:collapse;"><tbody>';
        for (let i = 0; i < fields.length; i += 2) {
          fieldTable += `<tr>
                        <td style="border:1px solid #ddd;padding:8px;text-align:center;">
                            ${fieldDisplayNames[fields[i]]}<br>${
            fields[i] === "marketCap" ||
            fields[i] === "volume" ||
            fields[i] === "totalRevenue"
              ? formatShort(fieldValues[fields[i]])
              : fieldValues[fields[i]] !== "-"
              ? formatNumberIndian(fieldValues[fields[i]])
              : "-"
          }
                        </td>`;
          if (fields[i + 1]) {
            fieldTable += `<td style="border:1px solid #ddd;padding:8px;text-align:center;">
                            ${fieldDisplayNames[fields[i + 1]]}<br>${
              fields[i + 1] === "marketCap" ||
              fields[i + 1] === "volume" ||
              fields[i + 1] === "totalRevenue"
                ? formatShort(fieldValues[fields[i + 1]])
                : fieldValues[fields[i + 1]] !== "-"
                ? formatNumberIndian(fieldValues[fields[i + 1]])
                : "-"
            }
                        </td>`;
          }
          fieldTable += "</tr>";
        }
        fieldTable += "</tbody></table>";
        const chartContainer =
          chartData.length > 1 ? `<div id="${chartId}"></div>` : "";

        return `
                    <div>
                        <h4>${params.data.name}</h4>
                        <p>Value: ${formatNumberIndian(params.data.value)}</p>
                        ${chartContainer}
                        ${fieldTable}
                    </div>
                `;
      },
    },
    series: [
      {
        name: "NIFTY Index",
        type: "treemap",
        visibleMin: 300,
        scaleLimit: {
          min: 1,
          max: 3,
        },
        nodeClick: false,
        roam: "zoom",
        label: {
          show: true,
          formatter: function (params) {
            const change =
              params.data.changes !== undefined &&
              params.data.changes[selectedOption] !== undefined
                ? Number(params.data.changes[selectedOption])
                : 0;
            const symbol =
              params.data.symbol !== undefined
                ? params.data.symbol.replace(".NS", "")
                : "()";
            return `${symbol}\n${change.toFixed(2)}%`;
          },
          fontSize: 14,
          fontFamily: "Inter",
          fontWeight: 700,
        },
        upperLabel: {
          show: true,
          height: 30,
          color: "#fff",
          formatter: function (params) {
            const name =
              params.data.name !== undefined ? params.data.name : "()";
            return `${name}`;
          },
          fontSize: 16,
        },
        itemStyle: {
          borderColor: "#fff",
        },
        levels: getLevelOption(),
        data: formattedData,
      },
    ],
  };
};
