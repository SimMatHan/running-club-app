// utils/utils.js
export const getRunTypeColor = (runType) => {
    switch (runType) {
      case "Interval":
        return "var(--color-run-5k)";
      case "Easy Run":
        return "var(--color-run-10k)";
      case "Race Run":
        return "var(--color-run-15k)";
      case "Long Run":
        return "var(--color-run-half-marathon)";
      case "Hygge":
        return "var(--color-run-marathon)";
      default:
        return "#FFFFFF"; // Default to white if no type matches
    }
  };
  