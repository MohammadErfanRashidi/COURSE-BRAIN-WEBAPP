import { useMobileMenuStore } from '../store/mobileMenuStore';

export default function HamburgerButton() {
  const isOpen = useMobileMenuStore((s) => s.isOpen);
  const toggle = useMobileMenuStore((s) => s.toggle);

  return (
    <button
      onClick={toggle}
      className="md:hidden w-10 h-10 bg-transparent hover:bg-slate-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 select-none relative z-50 active:scale-95"
      aria-label="منو"
    >
      <div className="w-5 h-4 relative flex items-center justify-center">
        <span className={`absolute w-full h-[1.5px] bg-current rounded-full transition-all duration-300 ${isOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
        <span className={`absolute w-full h-[1.5px] bg-current rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 translate-x-2' : 'opacity-100'}`} />
        <span className={`absolute w-full h-[1.5px] bg-current rounded-full transition-all duration-300 ${isOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
      </div>
    </button>
  );
}
