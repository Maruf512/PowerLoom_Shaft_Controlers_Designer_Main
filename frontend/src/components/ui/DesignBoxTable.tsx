// import { DesignGridType, DesignType } from "@/types/data";
// import { useEffect, useMemo, useState } from "react";
// import { BiCheckbox } from "react-icons/bi";

// const DesignBoxTable = ({
//   designerData,
//   setDesignerData,
// }: {
//   designerData: DesignType;
//   setDesignerData: React.Dispatch<React.SetStateAction<DesignType>>;
// }) => {
//   const createInitialDesignGrids = useMemo(() => {
//     const totalPalettes = designerData.total_color_palettes || 0;
//     return () => {
//       const girdArray = new Array(totalPalettes);
//       return girdArray.fill(null).map(() => ({
//         color_box: null,
//         total_pics: 0,
//       }));
//     };
//   }, [designerData.total_color_palettes]);

//   const [designGrids, setDesignGrids] = useState<DesignGridType[]>(
//     createInitialDesignGrids()
//   );

//   useEffect(() => {
//     setDesignGrids(createInitialDesignGrids());
//   }, [designerData.total_color_palettes, createInitialDesignGrids]);

//   const deisignGridRow = useMemo(() => {
//     return new Array(4).fill(null).map((_, i) => `Box ${i + 1}`);
//   }, [designerData]);

//   const handelColorBox = (columnbNum: number, rowNum: number) => {
//     setDesignGrids((prev) => {
//       const newGrids = [...prev];

//       if (newGrids[columnbNum]) {
//         const newColorBoxValue =
//           newGrids[columnbNum].color_box === rowNum + 1 ? null : rowNum + 1;

//         newGrids[columnbNum] = {
//           ...newGrids[columnbNum],
//           color_box: newColorBoxValue,
//         };
//       }

//       setDesignerData((prev) => ({ ...prev, design_grids: newGrids }));

//       return newGrids;
//     });
//   };

//   const handleTotalPicsChange = (columnIndex: number, value: string) => {
//     setDesignGrids((prevGrids) => {
//       const newGrids = [...prevGrids];

//       if (newGrids[columnIndex]) {
//         newGrids[columnIndex] = {
//           ...newGrids[columnIndex],
//           total_pics: Number(value) || 0,
//         };
//       }

//       setDesignerData((prev) => ({ ...prev, design_grids: newGrids }));

//       return newGrids;
//     });
//   };

//   return (
//     <div className="border border-muted w-full rounded-radius-lg">
//       <div className="flex justify-between bg-secondary border-b border-muted lg:px-6 px-3 py-2 font-semibold text-basec gap-2">
//         {deisignGridRow.map((item) => (
//           <p className="flex-1" key={item}>
//             {item}
//           </p>
//         ))}
//         <p className="flex-1">NOCV</p>
//       </div>
//       <div>
//         {designGrids.map((item, columbNum) => (
//           <div
//             key={columbNum}
//             className="flex justify-between lg:px-6 px-3 py-2 border-b border-muted last:border-none gap-2 text-strong bg-on-surface"
//           >
//             {deisignGridRow.map((_, rowNum) => (
//               <div key={rowNum} className="flex-1">
//                 <BiCheckbox
//                   onClick={() => handelColorBox(columbNum, rowNum)}
//                   className={`cursor-pointer text-xl ${
//                     item.color_box === rowNum + 1
//                       ? "text-blue-500"
//                       : "text-basec"
//                   }`}
//                 />
//               </div>
//             ))}
//             <div className="flex-1">
//               <input
//                 className="w-full border border-muted rounded-xs px-3 bg-secondary "
//                 type="number"
//                 placeholder=""
//                 value={item.total_pics === 0 ? "" : item.total_pics}
//                 onChange={(e) =>
//                   handleTotalPicsChange(columbNum, e.target.value)
//                 }
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default DesignBoxTable;

import { DesignErrorType, DesignType } from "@/types/data";
import { cn } from "@/utils/cn";
import { useEffect, useMemo } from "react";
import { IoIosCheckbox } from "react-icons/io";
import { MdCheckBoxOutlineBlank } from "react-icons/md";

const DesignBoxTable = ({
  designerData,
  setDesignerData,
  setDesignDataError,
  designDataError,
}: {
  designerData: DesignType;
  setDesignerData: React.Dispatch<React.SetStateAction<DesignType>>;
  setDesignDataError: React.Dispatch<React.SetStateAction<DesignErrorType>>;
  designDataError: DesignErrorType;
}) => {
  // Resize the grid rows to match Total Color Palettes WITHOUT wiping
  // existing rows: growing appends fresh rows, shrinking keeps the first N.
  // Previously the whole array was rebuilt from scratch on every change,
  // resetting all checkbox selections and NOCV inputs.
  useEffect(() => {
    const total = Math.max(0, designerData.total_color_palettes || 0);
    setDesignerData((prev) => {
      if (prev.design_grids.length === total) return prev;
      const kept = prev.design_grids.slice(0, total);
      while (kept.length < total) {
        kept.push({ color_box: null, total_pics: null });
      }
      return { ...prev, design_grids: kept };
    });
  }, [designerData.total_color_palettes, setDesignerData]);

  const deisignGridRow = useMemo(() => {
    return new Array(4).fill(null).map((_, i) => `Box ${i + 1}`);
  }, []);

  const handelColorBox = (columnbNum: number, rowNum: number) => {
    setDesignerData((prev) => {
      const newGrids = [...prev.design_grids];
      newGrids[columnbNum] = {
        ...newGrids[columnbNum],
        color_box:
          newGrids[columnbNum].color_box === rowNum + 1 ? null : rowNum + 1,
      };

      return { ...prev, design_grids: newGrids };
    });

    setDesignDataError((prev) => {
      const newErrorGrid = { ...prev.design_grids };

      newErrorGrid[columnbNum] = {
        ...newErrorGrid[columnbNum],
        color_box: "",
      };

      return { ...prev, design_grids: newErrorGrid };
    });
  };

  const handleTotalPicsChange = (columnIndex: number, value: string) => {
    setDesignerData((prev) => {
      const newGrids = [...prev.design_grids];
      if (newGrids[columnIndex]) {
        newGrids[columnIndex] = {
          ...newGrids[columnIndex],
          total_pics: Number(value) <= 0 ? null : Number(value),
        };
      }
      return { ...prev, design_grids: newGrids };
    });

    setDesignDataError((prev) => {
      const newErrorGrid = { ...prev.design_grids };

      newErrorGrid[columnIndex] = {
        ...newErrorGrid[columnIndex],
        total_pics: "",
      };

      return { ...prev, design_grids: newErrorGrid };
    });
  };

  return (
    <div className="border border-muted w-full rounded-radius-lg lg:max-h-[52rem] overflow-auto ">
      <div className="flex justify-between border-b border-muted py-4 tracking-wide font-semibold text-muted text-xs lg:text-sm sticky top-0 bg-primary px-2">
        <p className="lg:w-[4rem] w-[2rem] border-r border-muted flex items-center justify-center">
          No.
        </p>
        {deisignGridRow.map((item) => (
          <p
            className="flex-1 border-r border-muted flex items-center justify-center"
            key={item}
          >
            {item}
          </p>
        ))}
        <p className="flex-1 flex items-center justify-center">NOCV</p>
      </div>
      <div className="">
        {!!designerData.design_grids.length ? (
          <div>
            {designerData.design_grids.map((item, columbNum) => (
              <div
                key={columbNum}
                className={cn(
                  "flex justify-between items-center py-2 px-2 border-b border-muted/70 last:border-none text-strong bg-on-surface hover:bg-secondary text-xs lg:text-base",
                  {
                    "bg-error/5":
                      designDataError?.design_grids[columbNum]?.color_box,
                  }
                )}
              >
                <p className="lg:w-[4rem] w-[2rem] lg:text-sm flex items-center justify-center">
                  {columbNum + 1}
                </p>

                {deisignGridRow.map((_, rowNum) => (
                  <div
                    key={rowNum}
                    className="flex-1 flex items-center justify-center"
                    onClick={() => handelColorBox(columbNum, rowNum)}
                  >
                    {designerData.design_grids[columbNum].color_box ===
                    rowNum + 1 ? (
                      <IoIosCheckbox />
                    ) : (
                      <MdCheckBoxOutlineBlank />
                    )}
                  </div>
                ))}
                <div className="flex-1 w-[80%] flex items-center justify-center">
                  <input
                    className={cn(
                      "border border-muted rounded-xs px-3 text-xs py-1 w-[80%]",
                      {
                        "border-error":
                          designDataError?.design_grids[columbNum]?.total_pics,
                      }
                    )}
                    type="number"
                    placeholder=""
                    value={item.total_pics === null ? "" : item.total_pics}
                    onChange={(e) =>
                      handleTotalPicsChange(columbNum, e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center my-5 text-sm font-semibold">
            Enter Total Color Palettes
          </p>
        )}
      </div>
    </div>
  );
};

export default DesignBoxTable;
