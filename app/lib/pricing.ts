export const isWeightPricedUnit = (unitName: string) => {
  const normalizedUnitName = unitName.trim().toLowerCase().replace(/\./g, "");

  return normalizedUnitName === "кг" || normalizedUnitName === "kg";
};

type CalculateItemTotalParams = {
  packageWeight: number;
  quantity: number;
  unitName: string;
  unitPrice: number;
};

export const calculateItemTotal = ({
  packageWeight,
  quantity,
  unitName,
  unitPrice,
}: CalculateItemTotalParams) =>
  isWeightPricedUnit(unitName)
    ? unitPrice * packageWeight * quantity
    : unitPrice * quantity;
