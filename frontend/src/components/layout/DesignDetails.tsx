import { designerErrorEnitialState } from "@/constants/Designer";
import apiClient from "@/lib/apiClient";
import { Design, DesignErrorType, DesignType } from "@/types/data";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Button from "../ui/Button";
import DataErrorModal from "../ui/DataErrorModal";
import DeleteDesign from "../ui/DeleteDesign";
import { Modal, ModalContent } from "../ui/Modal";
import Semulator from "../ui/Semulator";
import { useToast } from "../ui/ToastProvider";
import ExportTxt from "../ui/ExportTxt";

const DesignDetails = ({
  designer,
  // Base API path without trailing slash. Owners use "designer/designs",
  // admins pass "auth/admin/designs" to act on any user's file.
  apiBase = "designer/designs",
  // Where to go after delete (admin detail view stays on /admin).
  deleteRedirect = "/",
  onDeleted,
}: {
  designer: Design;
  apiBase?: string;
  deleteRedirect?: string;
  onDeleted?: (id: number) => void;
}) => {
  const router = useRouter();
  const [designDataError, setDesignDataError] = useState<DesignErrorType>(
    designerErrorEnitialState
  );
  const [hasError, setHasError] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const toast = useToast();

  const designData: DesignType = useMemo(() => {
    return {
      name: designer.name,
      total_color_palettes: designer.total_color_palettes,
      color_box_1: designer.color_box_1,
      color_box_2: designer.color_box_2,
      color_box_3: designer.color_box_3,
      color_box_4: designer.color_box_4,
      starting_position: designer.starting_position,
      machine_type: designer.machine_type,
      design_grids: designer.design_grids,
    };
  }, [designer]);

  const deleteHandler = async () => {
    const { error } = await apiClient(`${apiBase}/${designer.id}`, {
      method: "DELETE",
    });

    if (error) {
      toast("Error deleting designer data", "error");
      return;
    }

    toast("Designer data deleted successfully", "success");
    onDeleted?.(designer.id);
    router.push(deleteRedirect);
  };

  return (
    <div className="grid-container ">
      <div className="box-item space-x-5 p-4" style={{ gridArea: "box-1" }}>
        <Microsemulator designer={designer} />
        <div className="space-y-2 min-w-0">
          <h2 className="capitalize font-medium line-clamp-2 lg:text-base text-sm">
            {designer.name}
          </h2>
          <p className="text-xs text-basec">ID: {designer.id}</p>
        </div>
      </div>

      <div
        className="flex lg:p-4 p-2 rounded-lg border border-muted"
        style={{ gridArea: "box-2" }}
      >
        <div className="flex flex-col items-center justify-center p-3 space-y-1 w-full text-center">
          <div className="text-[10px] md:text-sm text-basec">
            Starting Position
          </div>
          <div className="font-medium text-[12px] md:text-base text-gray-800">
            {designer.starting_position}
          </div>
        </div>

        <div className="border-l border-muted h-full w-px" />

        <div className="flex flex-col items-center justify-center p-3 space-y-1 w-full text-center">
          <div className="text-[10px] md:text-sm text-basec">Machine Type</div>
          <div className="font-medium text-[12px] md:text-base text-primary">
            {designer.machine_type || "N/A"}
          </div>
        </div>

        <div className="border-l border-muted h-full w-px" />

        <div className="flex flex-col items-center justify-center p-3 space-y-1 w-full text-center">
          <div className="text-[10px] md:text-sm text-basec">
            Total Color Palettes
          </div>
          <div className="font-medium text-[12px] md:text-base text-primary">
            {designer.total_color_palettes || "Not Specified"}
          </div>
        </div>
      </div>

      <div
        className="box-item p-4 w-full flex flex-col space-y-3"
        style={{ gridArea: "box-3" }}
      >
        <div className="text-[10px] md:text-sm text-basec ">Color Boxes</div>
        <ColorBox designer={designer} />
      </div>

      <div
        className="box-item justify-between lg:p-4 p-2 space-x-3 "
        style={{ gridArea: "box-4" }}
      >
        <div className="grid lg:grid-cols-4 grid-cols-2 gap-3 w-full h-full">
          <Semulator
            designerData={designData}
            setDesignDataError={setDesignDataError}
            setHasError={setHasError}
          />
          <ExportTxt
            designerData={designData}
            setDesignDataError={setDesignDataError}
            setHasError={setHasError}
          />
          <Link
            href={
              apiBase === "designer/designs"
                ? `/designer/edit/${designer.id}`
                : `/admin/designs/${designer.id}/edit`
            }
            className="w-full h-full"
          >
            <Button className="w-full h-full">Update</Button>
          </Link>
          <Button
            className="w-full h-full"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <DataErrorModal
        designDataError={designDataError}
        designerData={designer}
        hasError={hasError}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        className="flex  items-center justify-center"
      >
        <ModalContent
          className={cn(
            "duration-300 ease-in-out lg:w-[40%] w-[90%]",
            isDeleteModalOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
        >
          <DeleteDesign
            data={{ name: designer.name, id: designer.id }}
            deleteHandler={deleteHandler}
            setIsOpen={setIsDeleteModalOpen}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DesignDetails;

const Microsemulator = ({ designer }: { designer: Design }) => {
  const colorBoxes = [
    designer.color_box_1,
    designer.color_box_2,
    designer.color_box_3,
    designer.color_box_4,
  ];
  return (
    <div className="rounded-radius-lg overflow-hidden lg:h-16 h-10 aspect-square flex flex-col shrink-0">
      {designer.design_grids.map((grid, i) => {
        const bgColor = colorBoxes[grid.color_box - 1];
        return (
          <div
            key={i}
            className="h-full w-full"
            style={{ backgroundColor: bgColor }}
          ></div>
        );
      })}
    </div>
  );
};

const ColorBox = ({ designer }: { designer: Design }) => {
  const colorBoxes = [
    designer.color_box_1,
    designer.color_box_2,
    designer.color_box_3,
    designer.color_box_4,
  ];
  return (
    <div className="flex flex-col w-full rounded-radius-sm space-y-2">
      {colorBoxes.map((color, i) => (
        <div
          key={i}
          style={{ backgroundColor: color }}
          className="h-[4rem] w-full font-medium flex items-center justify-center lg:text-base text-xs rounded-radius-lg"
        >
          Box {i + 1}
        </div>
      ))}
    </div>
  );
};
