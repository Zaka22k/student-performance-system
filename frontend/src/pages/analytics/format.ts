// Числа в аналитике: «4,25» и «87,5 %»; нет данных — «—»
const number = (value: number, digits: number) =>
  value.toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const formatAverage = (value: number | null) => (value === null ? "—" : number(value, 2));

export const formatPercent = (value: number | null) => (value === null ? "—" : `${number(value, 1)} %`);
