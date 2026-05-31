import { useState, useCallback } from "react";

export function usePeriodo() {
  const hoy = new Date();
  // Inicialización por defecto en el próximo periodo (según tu lógica actual)
  const fechaProxima = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);

  const [month, setMonth] = useState(fechaProxima.getMonth());
  const [year, setYear] = useState(fechaProxima.getFullYear());

  const currentPeriod = `${year}-${String(month + 1).padStart(2, "0")}`;

  const handlePrevMonth = useCallback(() => {
    setMonth((prevMonth) => {
      if (prevMonth === 0) {
        setYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setMonth((prevMonth) => {
      if (prevMonth === 11) {
        setYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  }, []);

  const handleToday = useCallback(() => {
    setMonth(hoy.getMonth());
    setYear(hoy.getFullYear());
  }, []);

  const setPeriodo = useCallback((newYear, newMonth) => {
    setYear(newYear);
    setMonth(newMonth);
  }, []);

  return {
    month,
    year,
    currentPeriod,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
    setPeriodo,
  };
}
