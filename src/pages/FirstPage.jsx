// FirstPage.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import classes from "./FirstPage.module.css";
import { setTableData } from "./actions";

const FirstPage = () => {
  const dispatch = useDispatch();
  const tableData = useSelector((state) => state.tableData);

  const addRow = () => {
    dispatch(
      setTableData([
        ...tableData,
        { col: tableData.length + 1, id: "", name: "", article: "" },
      ]),
    );
  };

  const handleInputChange = (col, column, value) => {
    const updatedData = tableData.map((row) =>
      row.col === col ? { ...row, [column]: value } : row,
    );

    if (col === tableData.length && value.trim() !== "") {
      dispatch(
        setTableData([
          ...updatedData,
          { col: tableData.length + 1, id: "", name: "", article: "" },
        ]),
      );
    } else {
      dispatch(setTableData(updatedData));
    }
  };

  const handleDataPaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData("Text");
    const rows = clipboardData.split("\n");

    dispatch(
      setTableData(
        rows.reduce((acc, row, index) => {
          const cells = row.split("\t");
          if (cells.length >= 3) {
            if (index < tableData.length) {
              acc.push({
                ...tableData[index],
                id: tableData[index].id || cells[0] || "",
                name: tableData[index].name || cells[1] || "",
                article: tableData[index].article || cells[2] || "",
              });
            } else {
              acc.push({
                col: tableData.length + index + 1,
                id: cells[0] || "",
                name: cells[1] || "",
                article: cells[2] || "",
              });
            }
          }
          return acc;
        }, []),
      ),
    );
  };

  const clearTable = () => {
    dispatch(setTableData([{ col: 1, id: "", name: "", article: "" }]));
  };

  return (
    <div className={classes.main}>
      <div>
        <Link
          className={classes.button}
          to={{
            pathname: "/data",
          }}
        >
          Получить стикеры
        </Link>
      </div>
      <div className={classes.table}>
        <button type="button" onClick={addRow}>
          Добавить строку
        </button>
        <button type="button" onClick={clearTable}>
          Очистить таблицу
        </button>
        <table onPaste={handleDataPaste}>
          <thead>
            <tr>
              <th>ID (col)</th>
              <th>Колонка 1 (id)</th>
              <th>Колонка 2 (name)</th>
              <th>Колонка 3 (article)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.col}>
                <td>{row.col}</td>
                <td>
                  <input                 
                    type="text"
                    value={row.id}
                    onChange={(e) =>
                      handleInputChange(row.col, "id", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) =>
                      handleInputChange(row.col, "name", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.article}
                    onChange={(e) =>
                      handleInputChange(row.col, "article", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FirstPage;