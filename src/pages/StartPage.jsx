import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import classes from "./StartPage.module.css";
import Label from "../component/Label";

const StartPage = () => {
  const token =
    "eyJhbGciOiJFUzI1NiIsImtpZCI6IjIwMjUwOTA0djEiLCJ0eXAiOiJKV1QifQ.eyJhY2MiOjEsImVudCI6MSwiZXhwIjoxNzc5NzYwNDEzLCJpZCI6IjAxOWFiNjI0LTI2ZjEtNzFkNi05N2E1LTZmZTBhYjkyNzYzYyIsImlpZCI6ODg4MzU2NDYsIm9pZCI6OTQzNjU1LCJzIjo0OCwic2lkIjoiMGIwZGI0MzktOWQ3OC00NTEwLThlNDEtMDQzNTc5Yzg4MTNhIiwidCI6ZmFsc2UsInVpZCI6ODg4MzU2NDZ9.DCrB9E_Z20jwGvcam_uv67MhafBMaCRRofZ_r8_Z52qd5KRlDv3iCdxU8CeBDhnnfs4269i7ez5jdts0_bu2og"; // Замените на ваш токен

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

  useEffect(() => {
    // Группируем данные по артикулу
    const groupedData = tableData.reduce((acc, item) => {
      if (!acc[item.article]) {
        acc[item.article] = [];
      }
      acc[item.article].push(item);
      return acc;
    }, {});

    // Сортируем группы по количеству элементов в каждой группе
    const sortedGroups = Object.values(groupedData).sort(
      (a, b) => b.length - a.length,
    );

    // Объединяем отсортированные группы в единый массив
    const sortedData = sortedGroups.flat();

    setSortData(sortedData);
  }, [tableData]);

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

  console.log("фильтрованный массив", getPageItems())
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
            <span className={classes.loader}></span>{" "}
            <div className={classes.err}>Загружаем данные</div>
          </div>
        )}
      </div>
      <button className={classes.print} onClick={handlePrint}>
        ПЕЧАТЬ
      </button>
    </div>
  );
};

export default StartPage;