import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownUser from "./DropdownUser";
import Image from "next/image";

const Header = (props?: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4" aria-label={props?.sidebarOpen?.toString()}>
          <Link className="flex flex-shrink-0 items-center gap-2" href="/">
            <Image
              width={32}
              height={32}
              src={"/fortuneok.svg"}
              alt="FortuneOk Logo"
            />
            <span className="text-lg font-bold lg:block">FortuneOK</span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <DarkModeSwitcher />
          </ul>
          <DropdownUser />
        </div>
      </div>
    </header>
  );
};

export default Header;
