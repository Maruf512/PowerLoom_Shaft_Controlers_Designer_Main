import { AuthFieldsNameType } from "@/types/auth";
import { DesignErrorType, DesignGridType, DesignType } from "@/types/data";

export const authFormValidator = (
  formData: Record<AuthFieldsNameType, string>
) => {
  const newErrors = {} as Record<AuthFieldsNameType, string>;

  if (formData.email.trim() === "") {
    newErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = "Invalid email format";
  }

  if (formData.password === "") {
    newErrors.password = "Password is required";
  } else if (formData.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  }

  // Only validate `name` on forms that actually have it (register).
  // Login formData has no `name` key (undefined) and must not fail here.
  if (
    "name" in formData &&
    (formData.name ?? "").trim() === ""
  ) {
    newErrors.name = "name is required";
  }

  return newErrors;
};

export const designDataValidator = (
  designData: DesignType,
  setDesignDataError: React.Dispatch<React.SetStateAction<DesignErrorType>>
): boolean => {
  const errors: DesignErrorType = {
    name: "",
    total_color_palettes: "",
    color_box_1: "",
    color_box_2: "",
    color_box_3: "",
    color_box_4: "",
    starting_position: "",
    machine_type: "",
    design_grids: designData.design_grids.map(() => ({
      color_box: "",
      total_pics: "",
    })),
  };

  let isValid = false;

  if (
    designData.name === "" ||
    designData.name === null ||
    designData.name === undefined
  ) {
    errors.name = "Name is Required";
    isValid = true;
  }

  if (
    designData.total_color_palettes === null ||
    designData.total_color_palettes === undefined ||
    designData.total_color_palettes === 0
  ) {
    errors.total_color_palettes = "Total Color Palettes is Required";
    isValid = true;
  }

  if (
    designData.color_box_1 === null ||
    designData.color_box_1 === undefined ||
    designData.color_box_1 === ""
  ) {
    errors.color_box_1 = "Color Box 1 is Required";
    isValid = true;
  }
  if (
    designData.color_box_2 === null ||
    designData.color_box_2 === undefined ||
    designData.color_box_2 === ""
  ) {
    errors.color_box_2 = "Color Box 2 is Required";
    isValid = true;
  }
  if (
    designData.color_box_3 === null ||
    designData.color_box_3 === undefined ||
    designData.color_box_3 === ""
  ) {
    errors.color_box_3 = "Color Box 3 is Required";
    isValid = true;
  }
  if (
    designData.color_box_4 === null ||
    designData.color_box_4 === undefined ||
    designData.color_box_4 === ""
  ) {
    errors.color_box_4 = "Color Box 4 is Required";
    isValid = true;
  }

  if (
    designData.starting_position === null ||
    designData.starting_position === undefined ||
    designData.starting_position === ""
  ) {
    errors.starting_position = "Starting Position is Required";
    isValid = true;
  }

  if (
    designData.machine_type === null ||
    designData.machine_type === undefined ||
    designData.machine_type === ""
  ) {
    errors.machine_type = "Machine Type is Required";
    isValid = true;
  }

  designData.design_grids.forEach((item: DesignGridType, i: number) => {
    // if (!errors.design_grids[i]) {
    //   errors.design_grids[i] = { color_box: "", total_pics: "" };
    // }

    if (
      item.color_box === null ||
      item.color_box === undefined ||
      item.color_box === 0
    ) {
      errors.design_grids[i].color_box = "Choose a Color Box";
      isValid = true;
    }

    if (
      item.total_pics === null ||
      item.total_pics === undefined ||
      item.total_pics === 0
    ) {
      errors.design_grids[i].total_pics = "Total Pics is Required";
      isValid = true;
    }
  });

  setDesignDataError(errors);
  return isValid;
};
