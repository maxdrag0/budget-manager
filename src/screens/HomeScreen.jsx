import { useRoute, useNavigation } from "@react-navigation/native";
import { View, StyleSheet, PanResponder } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "@/styles/styles";
import MonthBalance from "@/components/Home/MonthBalance";
import MonthSelector from "@/components/Home/MonthSelector";
import MovementsFlatList from "@/components/Movement/MovementsFlatList";
import ModalMovement from "@/components/Movement/ModalMovement";
import ModalIngreso from "@/components/Ingresos/ModalIngreso";
import {
  cargarDatosDelPeriodo,
  guardarMovimiento,
  eliminarMovimiento,
  guardarIngreso,
} from "@/controller/controller";

import { usePeriodo } from "@/hooks/usePeriodo";

export default function HomeScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {
    month,
    year,
    currentPeriod,
    handlePrevMonth,
    handleNextMonth,
    handleToday,
    setPeriodo,
  } = usePeriodo();

  const userId = useSelector((state) => state.auth.uid);
  const movements = useSelector((state) => state.movements.value);
  const incomes = useSelector((state) => state.incomes.value);

  const [modalVisible, setModalVisible] = useState(false);
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);

  const [modalType, setModalType] = useState("egreso");
  const [movementToEdit, setMovementToEdit] = useState(null);

  const handlersRef = useRef({ handlePrevMonth, handleNextMonth, handleToday });

  useEffect(() => {
    handlersRef.current = { handlePrevMonth, handleNextMonth };
  }, [handlePrevMonth, handleNextMonth]);

  useEffect(() => {
    if (route.params?.openModal) {
      const type = route.params.openModal;
      if (route.params.resetToToday) {
        handleToday(); // Mover al período actual
      }
      setModalType(type);
      setMovementToEdit(null); // Asegurar que está creando, no editando
      setModalVisible(true);

      // Limpiamos los parámetros usando un micro-retraso
      setTimeout(() => {
        navigation.setParams({ openModal: undefined, resetToToday: undefined });
      }, 50);
    }
  }, [route.params?.openModal, route.params?.resetToToday]);

  const panResponder = useRef(
    PanResponder.create({
      // We only become active if it's a clear horizontal swipe
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (isAnyModalOpenRef.current) {
          return false;
        }
        return (
          Math.abs(gestureState.dx) > 30 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          // Swiped right -> Next month
          handlersRef.current.handlePrevMonth();
        } else if (gestureState.dx < -50) {
          // Swiped left -> Previous month
          handlersRef.current.handleNextMonth();
        }
      },
    }),
  ).current;

  const isAnyModalOpenRef = useRef(false);
  isAnyModalOpenRef.current = modalVisible || incomeModalVisible;

  // Cargamos datos del periodo cuando cambia el mes o al montar
  useEffect(() => {
    if (userId) {
      cargarDatosDelPeriodo(userId, currentPeriod, dispatch);
    }
  }, [userId, currentPeriod]);

  // Datos derivados de Redux
  const sumaGastos = movements
    .filter((m) => m.tipo === "egreso")
    .reduce((acc, m) => acc + (m.monto || 0), 0);

  const sumaIngresosAdicionales = movements
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, m) => acc + (m.monto || 0), 0);

  const ingresoBase = incomes[currentPeriod] ?? 0;
  const ingresoDelMes = ingresoBase + sumaIngresosAdicionales;

  const handleGuardarMovement = async ({
    id,
    concepto,
    monto,
    fecha,
    periodo,
    categoria_id,
    tipo,
    fotoUri,
  }) => {
    const esDistintoPeriodo = periodo !== currentPeriod;

    await guardarMovimiento(
      concepto,
      monto,
      fecha,
      periodo,
      categoria_id,
      tipo,
      fotoUri,
      userId,
      dispatch,
      id,
      currentPeriod,
    );

    if (esDistintoPeriodo) {
      const [yearStr, monthStr] = periodo.split("-");
      setPeriodo(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1);
    }
  };

  const handleGuardarIngreso = async (monto) => {
    await guardarIngreso(userId, currentPeriod, monto, dispatch);
  };

  const handleEliminarMovimientosMultiples = async (ids) => {
    for (const id of ids) {
      await eliminarMovimiento(userId, id, dispatch);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea} {...panResponder.panHandlers}>
        <MonthSelector
          currentMonth={month}
          currentYear={year}
          onToday={handleToday}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />

        <View style={localStyles.balanceWrapper}>
          <MonthBalance
            income={ingresoDelMes}
            outcome={sumaGastos}
            onEditIncome={() => setIncomeModalVisible(true)}
          />
        </View>
        <View style={localStyles.listWrapper}>
          <MovementsFlatList
            items={movements}
            onEditMovement={(movement) => {
              setMovementToEdit(movement);
              setModalVisible(true);
            }}
            onDeleteMultiple={handleEliminarMovimientosMultiples}
          />
        </View>
      </SafeAreaView>

      {/* Modal para crear/editar gasto */}
      <ModalMovement
        tipo={modalType}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setMovementToEdit(null);
        }}
        onSubmit={handleGuardarMovement}
        onDelete={(id) => eliminarMovimiento(userId, id, dispatch)}
        periodo={currentPeriod}
        movementToEdit={movementToEdit}
      />

      {/* Modal para crear/editar ingreso del periodo */}
      <ModalIngreso
        visible={incomeModalVisible}
        onClose={() => setIncomeModalVisible(false)}
        onSubmit={handleGuardarIngreso}
        periodo={currentPeriod}
        valorActual={ingresoDelMes}
      />
    </>
  );
}

const localStyles = StyleSheet.create({
  balanceWrapper: {
    paddingHorizontal: 10,
    zIndex: 1,
  },
  listWrapper: {
    flex: 1,
    marginTop: 5,
  },
});
