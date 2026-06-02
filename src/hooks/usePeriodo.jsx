import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPeriod, setToday, nextMonth, prevMonth } from "@/store/periodSlice/periodSlice";

export function usePeriodo() {
  const dispatch = useDispatch();
  const month = useSelector((state) => state.period.month);
  const year = useSelector((state) => state.period.year);

  const currentPeriod = `${year}-${String(month + 1).padStart(2, "0")}`;

  const handlePrevMonth = useCallback(() => {
    dispatch(prevMonth());
  }, [dispatch]);

  const handleNextMonth = useCallback(() => {
    dispatch(nextMonth());
  }, [dispatch]);

  const handleToday = useCallback(() => {
    dispatch(setToday());
  }, [dispatch]);

  const setPeriodo = useCallback((newYear, newMonth) => {
    dispatch(setPeriod({ year: newYear, month: newMonth }));
  }, [dispatch]);

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
