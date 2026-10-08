import { FilterPropsType } from "@/types/props";
import { useEffect, useState } from "react";
import { BiSearch, BiX } from "react-icons/bi";
import Button from "./Button";

const Filter = ({ search, setSearch }: FilterPropsType) => {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  const submit = () => setSearch(searchValue.trim());
  const clear = () => {
    setSearchValue("");
    setSearch("");
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center gap-4 px-4 lg:px-6 py-3 rounded-radius-lg border border-muted bg-background ">
      <div className="h-7 flex items-center justify-center lg:w-fit w-full">
        <input
          type="text"
          placeholder="Search name, machine, date…"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") clear();
          }}
          className="border border-muted h-full rounded-l-full rounded-r-none px-3 text-sm border-r-0 lg:w-fit w-full"
        />
        {searchValue || search ? (
          <button
            onClick={clear}
            aria-label="Clear search"
            className="h-full px-2 border-y border-muted bg-secondary text-muted hover:text-strong"
          >
            <BiX size={16} />
          </button>
        ) : null}
        <Button
          className="h-full px-4 rounded-none rounded-r-full bg-primary text-on-surface hover:bg-primary/90 transition flex items-center justify-center"
          onClick={submit}
        >
          <BiSearch size={16} />
        </Button>
      </div>

      {/* Uncomment and improve these buttons if needed */}
      {/* <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
        <Button
          variant="outline"
          className={cn("px-6 py-2 text-sm", {
            "bg-primary text-white": display === "design",
          })}
          onClick={() => setDisplay("design")}
        >
          Design
        </Button>
        <Button
          variant="outline"
          className={cn("px-6 py-2 text-sm", {
            "bg-primary text-white": display === "color",
          })}
          onClick={() => setDisplay("color")}
        >
          Color
        </Button>
      </div> */}
    </div>
  );
};

export default Filter;
