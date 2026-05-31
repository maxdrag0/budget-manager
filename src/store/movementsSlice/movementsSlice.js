import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

const movementsSlice = createSlice({
  name: "movements",
  initialState,
  reducers: {
    createMovement: (state, action) => {
      state.value.push(action.payload);
    },
    editMovement: (state, action) => {
      const {
        id,
        concepto,
        monto,
        fecha,
        periodo,
        categoria_id,
        tipo,
        fotoUri,
      } = action.payload;
      const existingMovement = state.value.find(
        (movement) => movement.id === id,
      );

      if (existingMovement) {
        existingMovement.concepto = concepto;
        existingMovement.monto = monto;
        existingMovement.fecha = fecha;
        if (periodo !== undefined) {
          existingMovement.periodo = periodo;
        }
        if (categoria_id !== undefined) {
          existingMovement.categoria_id = categoria_id;
        }
        if (tipo !== undefined) {
          existingMovement.tipo = tipo;
        }
        if (fotoUri !== undefined) {
          existingMovement.fotoUri = fotoUri;
        }
      }
    },
    setMovementPhotoUrl: (state, action) => {
      const { id, fotoUrl } = action.payload;
      const movement = state.value.find((movement) => movement.id === id);
      if (movement) {
        movement.fotoUrl = fotoUrl;
      }
    },
    deleteMovement: (state, action) => {
      state.value = state.value.filter(
        (movement) => movement.id !== action.payload,
      );
    },
    clearMovements: (state) => {
      state.value = [];
    },
    setMovements: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const {
  createMovement,
  editMovement,
  deleteMovement,
  setMovementPhotoUrl,
  clearMovements,
  setMovements,
} = movementsSlice.actions;
export default movementsSlice.reducer;
