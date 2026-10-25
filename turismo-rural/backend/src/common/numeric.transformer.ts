// Postgres devuelve los decimal como string; esto los convierte a number.
export const numeric = {
  to: (v?: number) => v,
  from: (v?: string | null) => (v == null ? v : parseFloat(v)),
};
