import {
  Gender,
  MacronutrientTargets,
  Status,
  UserBasicInfo,
} from "../model/userProfile";

// Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
export const calculateBMR = (profile: UserBasicInfo): number => {
  let bmr: number;

  if (profile.gender === Gender.Male) {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }

  return bmr;
};

// Calculate Total Daily Energy Expenditure (TDEE) based on BMR and activity level
export const calculateTDEE = (profile: UserBasicInfo): number => {
  const bmr = calculateBMR(profile);
  const tdee = bmr * profile.activityLevel;
  return tdee;
};

export const calculateMacros = (
  tdee: number,
  bmr: number,
  weight: number,
  status: Status
): MacronutrientTargets => {
  const adjustedTDEE = (() => {
    switch (status) {
      case "cut":
        return Math.max(bmr + 100, tdee - 500);
      case "bulk":
        return tdee + 300;
      default:
        return tdee;
    }
  })();

  const proteinIntake = (() => {
    switch (status) {
      case "cut":
        return weight * 2;
      case "bulk":
        return weight * 1.7;
      case "maintenance":
        return weight * 1.8;
      default:
        return weight * 1.7;
    }
  })();

  const carbsIntake = (() => {
    switch (status) {
      case "cut":
        return weight * 4;
      case "bulk":
        return weight * 6;
      case "maintenance":
        return weight * 5;
      default:
        return weight * 5;
    }
  })();

  const fatIntake = (() => {
    switch (status) {
      case "cut":
        return weight * 0.7;
      case "bulk":
        return weight;
      case "maintenance":
        return weight * 0.8;
      default:
        return weight * 0.8;
    }
  })();

  return {
    protein: proteinIntake,
    carbonhydrates: carbsIntake,
    fats: fatIntake,
    calories: adjustedTDEE,
  };
};
