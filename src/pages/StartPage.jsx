import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import classes from "./StartPage.module.css";
import Label from "../component/Label";

// Вынесли вспомогательную функцию наружу компонента
const getInitialToken = () => {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    return window.localStorage.getItem("wb_token") || "";
  } catch {
    return "";
  }
};

const getInitialOzonClientId = () => {
  return localStorage.getItem("ozon_client_id") || "";
};

const getInitialOzonApiKey = () => {
  return localStorage.getItem("ozon_api_key") || "";
};

const StartPage = () => {
  // Wildberries
  const [token, setToken] = useState(getInitialToken);
  const [tokenInput, setTokenInput] = useState(getInitialToken());

  // Ozon
  const [ozonClientId, setOzonClientId] = useState(
    getInitialOzonClientId
  );

  const [ozonClientIdInput, setOzonClientIdInput] = useState(
    getInitialOzonClientId()
  );

  const [ozonApiKey, setOzonApiKey] = useState(
    getInitialOzonApiKey
  );

  const [ozonApiKeyInput, setOzonApiKeyInput] = useState(
    getInitialOzonApiKey()
  );

  // таблица с данными
  const tableData = useSelector((state) => state.tableData);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 90;
  const [sortData, setSortData] = useState([]);
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [loadedCount, setLoadedCount] = useState(0);

  const handleLabelLoaded = useCallback(() => {
    setLoadedCount((prev) => prev + 1);
  }, []);

  // группировка и сортировка данных по article
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

  // сброс счётчика при смене страницы
  useEffect(() => {
    setLoadedCount(0);
  }, [currentPage]);

  // сохранить токен из формы
  const handleSaveToken = (e) => {
    e.preventDefault();
    const value = tokenInput.trim();
    if (!value) return;

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("wb_token", value);
      }
    } catch {
      // если localStorage недоступен — просто игнорируем
    }

    setToken(value);
  };

  const handleSaveOzonCredentials = () => {
    const normalizedClientId = ozonClientIdInput.trim();
    const normalizedApiKey = ozonApiKeyInput.trim();

    if (!normalizedClientId) {
      alert("Введите Ozon Client-Id");
      return;
    }

    if (!normalizedApiKey) {
      alert("Введите Ozon Api-Key");
      return;
    }

    localStorage.setItem("ozon_client_id", normalizedClientId);
    localStorage.setItem("ozon_api_key", normalizedApiKey);

    setOzonClientId(normalizedClientId);
    setOzonApiKey(normalizedApiKey);
  };

  // очистить токен
  const handleClearToken = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("wb_token");
      }
    } catch {
      // игнорируем
    }
    setToken("");
    setTokenInput("");
  };

  const handleDeleteOzonCredentials = () => {
  localStorage.removeItem("ozon_client_id");
  localStorage.removeItem("ozon_api_key");

  setOzonClientId("");
  setOzonClientIdInput("");

  setOzonApiKey("");
  setOzonApiKeyInput("");
  };

  // ⬇️ ВАЖНО: условный рендер уже ПОСЛЕ всех хуков
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
              ozonClientId={ozonClientId}
              ozonApiKey={ozonApiKey}
              key={item.id}
              data={item}
              ind={index}
              currentPage={currentPage}
              onLoaded={handleLabelLoaded}
            />
          ))
        ) : (
          <div className={classes.container}>
            <span className={classes.loader}></span>{" "}
            <div className={classes.err}>Загружаем данные</div>
          </div>
        )}
      </div>

      <button className={classes.print} onClick={handlePrint}>
        ПЕЧАТЬ
      </button>

      <div className={classes.pagin}>
        <button className={classes.btn} onClick={handleClearToken}>
          Сменить токен WB
        </button>
      </div>

      <div className={classes.pagin}>
        <div>
          <input
            type="text"
            placeholder="Ozon Client-Id"
            value={ozonClientIdInput}
            onChange={(event) =>
              setOzonClientIdInput(event.target.value)
            }
          />

          <input
            type="password"
            placeholder="Ozon Api-Key"
            value={ozonApiKeyInput}
            onChange={(event) =>
              setOzonApiKeyInput(event.target.value)
            }
          />

          <button
            className={classes.btn}
            type="button"
            onClick={handleSaveOzonCredentials}
          >
            Сохранить данные Ozon
          </button>

          <button
            className={classes.btn}
            type="button"
            onClick={handleDeleteOzonCredentials}
          >
            Удалить данные Ozon
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartPage;
