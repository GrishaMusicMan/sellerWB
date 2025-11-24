import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import classes from "./StartPage.module.css";
import Label from "../component/Label";

const StartPage = () => {
  // Функция для безопасного чтения токена
  const getInitialToken = () => {
    // Если мы в Node (dev-сервер, HtmlWebpackPlugin и т.п.) – не трогаем localStorage вообще
    if (
      typeof process !== "undefined" &&
      process.versions &&
      process.versions.node
    ) {
      return "";
    }

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem("wb_token") || "";
      }
      return "";
    } catch (e) {
      return "";
    }
  };

  // состояние токена
  const [token, setToken] = useState(getInitialToken);
  const [tokenInput, setTokenInput] = useState("");

  const tableData = useSelector((state) => state.tableData);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 90;
  const [sortData, setSortData] = useState([]);
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [loadedCount, setLoadedCount] = useState(0);

  const handleLabelLoaded = () => {
    setLoadedCount((prev) => prev + 1);
  };

  // Группировка/сортировка данных
  useEffect(() => {
    const groupedData = tableData.reduce((acc, item) => {
      if (!acc[item.article]) {
        acc[item.article] = [];
      }
      acc[item.article].push(item);
      return acc;
    }, {});

    const sortedGroups = Object.values(groupedData).sort(
      (a, b) => b.length - a.length,
    );

    const sortedData = sortedGroups.flat();
    setSortData(sortedData);
  }, [tableData]);

  // Сбрасываем счётчик загруженных стикеров на смене страницы
  useEffect(() => {
    setLoadedCount(0);
  }, [currentPage]);

  const getPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortData.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const totalPages = Math.ceil(sortData.length / itemsPerPage);

  // сохраняем токен, введённый пользователем
  const handleSaveToken = (e) => {
    e.preventDefault();
    const value = tokenInput.trim();
    if (!value) return;

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("wb_token", value);
      }
    } catch (e) {
      // если вдруг localStorage недоступен – просто пропускаем
    }

    setToken(value);
    setTokenInput("");
  };

  const handleClearToken = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("wb_token");
      }
    } catch (e) {
      // игнорируем
    }
    setToken("");
    setTokenInput("");
  };

  // 🔴 ВАЖНО: if (!token) стоит ТЕПЕРЬ ПОСЛЕ всех хуков,
  // поэтому ESLint больше не ругается на "hooks called conditionally"
  if (!token) {
    return (
      <div className={classes.tokenWrapper}>
        <h2>Введите токен Wildberries</h2>
        <form onSubmit={handleSaveToken} className={classes.tokenForm}>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="WB токен"
            className={classes.tokenInput}
          />
          <button type="submit" className={classes.btn}>
            Сохранить
          </button>
        </form>
      </div>
    );
  }

  console.log("фильтрованный массив", getPageItems());

  return (
    <div>
      <div className={classes.pagin}>
        <div>
          {loadedCount < getPageItems().length ? (
            <div className={classes.loaderText}>
              Загружено {loadedCount} из {getPageItems().length}
            </div>
          ) : (
            <div className={classes.successText}>Успешно загружено</div>
          )}
        </div>
        <button
          className={classes.btn}
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          prev
        </button>
        <span>
          Страница {currentPage} / {totalPages}
        </span>
        <button
          className={classes.btn}
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          next
        </button>
      </div>

      <div ref={componentRef}>
        {sortData.length > 0 ? (
          getPageItems().map((item, index) => (
            <Label
              token={token}
              key={item.id}
              data={item}
              ind={index}
              currentPage={currentPage}
              onLoaded={handleLabelLoaded}
            />
          ))
        ) : (
          <div className={classes.container}>
            <span className={classes.loader}></span>
            <div className={classes.err}>Загружаем данные</div>
          </div>
        )}
      </div>

      <button className={classes.print} onClick={handlePrint}>
        ПЕЧАТЬ
      </button>
      <button className={classes.btn} onClick={handleClearToken}>
        Сменить токен
      </button>
    </div>
  );
};

export default StartPage;
